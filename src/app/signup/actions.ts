"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

import { prisma } from "@/lib/prisma"

export type SignupState = { error?: string; success?: boolean }

export async function signup(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()
  const name = String(formData.get("name") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return { error: "Email and password are required." }
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: "An account with this email already exists." }
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.create({
    data: {
      email,
      name: name || null,
      passwordHash,
      role: "USER",
      status: "PENDING",
    },
  })

  // Surface the new request on the admin Users screen.
  revalidatePath("/users")
  return { success: true }
}
