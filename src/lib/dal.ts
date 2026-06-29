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

/**
 * Whether `userId` holds the per-project "dev" role on `projectId`.
 * Fails closed (returns false) if the lookup errors — e.g. before the
 * ProjectDev migration is applied — so member views never break.
 */
export async function isProjectDev(
  projectId: string,
  userId: string
): Promise<boolean> {
  try {
    const row = await prisma.projectDev.findUnique({
      where: { userId_projectId: { userId, projectId } },
      select: { id: true },
    })
    return Boolean(row)
  } catch {
    return false
  }
}

/**
 * Gate a non-secret project mutation: allows global admins and users granted
 * the "dev" role on this specific project. Throws otherwise. Secrets, project
 * settings, and user management must keep using `requireAdmin`.
 */
export async function requireProjectEditor(projectId: string) {
  const user = await getCurrentUser()
  if (user.role === "ADMIN") return user
  if (projectId && (await isProjectDev(projectId, user.id))) return user
  throw new Error("Forbidden: project dev or admin access required.")
}
