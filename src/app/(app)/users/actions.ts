"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/dal"

export type UserActionState = { error?: string; success?: boolean }

type Role = "ADMIN" | "USER"

function normalizeRole(value: FormDataEntryValue | null): Role {
  return value === "ADMIN" ? "ADMIN" : "USER"
}

export async function createUser(
  _prev: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  await requireAdmin()

  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const name = String(formData.get("name") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const role = normalizeRole(formData.get("role"))

  if (!email || !password) {
    return { error: "Email and password are required." }
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: "A user with this email already exists." }
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.create({
    data: { email, name: name || null, passwordHash, role },
  })

  revalidatePath("/users")
  return { success: true }
}

export async function updateUser(
  _prev: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  await requireAdmin()

  const id = String(formData.get("id") ?? "")
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const name = String(formData.get("name") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const role = normalizeRole(formData.get("role"))

  if (!id || !email) {
    return { error: "Missing user information." }
  }

  // Email must stay unique across other users.
  const clash = await prisma.user.findFirst({
    where: { email, NOT: { id } },
  })
  if (clash) {
    return { error: "Another user already uses this email." }
  }

  const data: {
    email: string
    name: string | null
    role: Role
    passwordHash?: string
  } = { email, name: name || null, role }

  if (password) {
    if (password.length < 8) {
      return { error: "Password must be at least 8 characters." }
    }
    data.passwordHash = await bcrypt.hash(password, 10)
  }

  await prisma.user.update({ where: { id }, data })

  revalidatePath("/users")
  return { success: true }
}

export async function setUserProjects(
  userId: string,
  projectIds: string[]
): Promise<UserActionState> {
  await requireAdmin()
  if (!userId) return { error: "Missing user." }

  await prisma.user.update({
    where: { id: userId },
    data: { projects: { set: projectIds.map((id) => ({ id })) } },
  })

  revalidatePath("/users")
  revalidatePath("/")
  return { success: true }
}

export async function deleteUser(id: string): Promise<UserActionState> {
  const me = await requireAdmin()
  if (me.id === id) {
    return { error: "You can't delete your own account." }
  }

  await prisma.user.delete({ where: { id } })
  revalidatePath("/users")
  return { success: true }
}
