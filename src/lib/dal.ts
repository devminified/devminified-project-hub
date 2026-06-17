import "server-only"
import { cache } from "react"
import { redirect } from "next/navigation"

import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

/**
 * Verify there is a valid session. Redirects to /login when missing.
 * Cached per-request so multiple calls don't repeat work.
 */
export const requireAuth = cache(async () => {
  const session = await getSession()
  if (!session?.userId) {
    redirect("/login")
  }
  return session
})

/**
 * Load the authenticated user from the database. Redirects to /login if the
 * session is invalid or the user no longer exists.
 */
export const getCurrentUser = cache(async () => {
  const session = await requireAuth()
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true },
  })
  if (!user) {
    redirect("/login")
  }
  return user
})

/** Throws if the current user is not an admin. Use to gate mutations. */
export async function requireAdmin() {
  const user = await getCurrentUser()
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden: admin access required.")
  }
  return user
}
