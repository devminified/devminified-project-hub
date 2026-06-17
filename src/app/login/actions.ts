"use server"

import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"

import { prisma } from "@/lib/prisma"
import { createSession, deleteSession } from "@/lib/session"

export type LoginState = { error?: string }

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  const user = await prisma.user.findUnique({ where: { email } })

  // Generic message so we don't reveal whether the email exists.
  const invalid = { error: "Invalid credentials." }
  if (!user) return invalid

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return invalid

  // Any user provisioned in the database may log in. Manage access by
  // adding/removing users on the Users page.
  await createSession({ id: user.id, email: user.email, role: user.role })
  redirect("/")
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}
