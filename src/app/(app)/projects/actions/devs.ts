"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/dal"
import { revalidateProject, type ActionState } from "./helpers"

export type DevCandidate = {
  id: string
  email: string
  name: string | null
  isDev: boolean
}

/**
 * Admin-only: list this project's approved non-admin MEMBERS and whether each
 * currently holds the "dev" role on this project. Only members are eligible —
 * the dev role is per-project, so assign project access (on the Users screen)
 * first. Fetched lazily when the Manage devs dialog opens.
 */
export async function listProjectDevs(
  projectId: string
): Promise<DevCandidate[]> {
  await requireAdmin()
  if (!projectId) return []

  const [devs, users] = await Promise.all([
    prisma.projectDev.findMany({
      where: { projectId },
      select: { userId: true },
    }),
    prisma.user.findMany({
      where: {
        role: "USER",
        status: "APPROVED",
        // Only users who are members of THIS project.
        projects: { some: { id: projectId } },
      },
      orderBy: { email: "asc" },
      select: { id: true, email: true, name: true },
    }),
  ])

  const devIds = new Set(devs.map((d) => d.userId))
  return users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    isDev: devIds.has(u.id),
  }))
}

/**
 * Admin-only: grant or revoke a user's "dev" role on a project. Granting also
 * connects the user as a project member (view access); revoking leaves their
 * membership untouched.
 */
export async function setProjectDev(
  projectId: string,
  userId: string,
  makeDev: boolean
): Promise<ActionState> {
  await requireAdmin()
  if (!projectId || !userId) return { error: "Missing project or user." }

  if (makeDev) {
    await prisma.projectDev.upsert({
      where: { userId_projectId: { userId, projectId } },
      create: { userId, projectId },
      update: {},
    })
    // A dev needs to be able to open the project, so ensure view access too.
    await prisma.project.update({
      where: { id: projectId },
      data: { members: { connect: { id: userId } } },
    })
  } else {
    await prisma.projectDev.deleteMany({ where: { userId, projectId } })
  }

  await revalidateProject(projectId)
  revalidatePath("/")
  return { success: true }
}
