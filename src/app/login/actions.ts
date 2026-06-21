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
  const invalid = { error: "Invalid credentials." }
  if (!user) return invalid
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return invalid
  if (user.status !== "APPROVED") {
    return {
      error:
        "Your account is awaiting admin approval. You'll be able to sign in once it's accepted.",
    }
  }
  await createSession({ id: user.id, email: user.email, role: user.role })
  redirect("/")
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}
