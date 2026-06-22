import "server-only"

import { prisma } from "@/lib/prisma"
import { toUpdatedAt } from "@/lib/projects/utils"

export type AdminUserRow = {
  id: string
  email: string
  name: string | null
  role: "ADMIN" | "USER"
  status: "PENDING" | "APPROVED"
  createdAt: string
  projectIds: string[]
}

export type ProjectOption = { id: string; name: string }

/** All users (with their assigned project ids) for the admin Users screen. */
export async function getUsersForAdmin(): Promise<AdminUserRow[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      projects: { select: { id: true } },
    },
  })

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    status: u.status,
    createdAt: toUpdatedAt(u.createdAt),
    projectIds: u.projects.map((p) => p.id),
  }))
}

/** Minimal project list for the "assign project access" picker. */
export async function getProjectOptions(): Promise<ProjectOption[]> {
  return prisma.project.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  })
}
