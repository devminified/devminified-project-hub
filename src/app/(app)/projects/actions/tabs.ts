"use server"

import { prisma } from "@/lib/prisma"
import { requireProjectEditor } from "@/lib/dal"
import type { TabFeature } from "@/lib/projects/types"
import { revalidateProject, type ActionState } from "./helpers"

function asFeature(value: unknown): TabFeature | null {
  return value === "DOC" || value === "ENV" || value === "README" ? value : null
}

/** Add a new tab to a project's feature, appended after the existing ones. */
export async function createTab(
  projectId: string,
  feature: TabFeature,
  name: string
): Promise<ActionState> {
  await requireProjectEditor(projectId)
  const f = asFeature(feature)
  if (!projectId || !f) return { error: "Invalid request." }
  const clean = name.trim()
  if (!clean) return { error: "Tab name is required." }

  // Case-insensitive duplicate guard within the same feature.
  const existing = await prisma.projectTab.findFirst({
    where: { projectId, feature: f, name: { equals: clean, mode: "insensitive" } },
    select: { id: true },
  })
  if (existing) return { error: `"${clean}" already exists.` }

  const max = await prisma.projectTab.aggregate({
    where: { projectId, feature: f },
    _max: { order: true },
  })
  await prisma.projectTab.create({
    data: { projectId, feature: f, name: clean, order: (max._max.order ?? -1) + 1 },
  })
  await revalidateProject(projectId)
  return { success: true }
}

/** Rename an existing tab. */
export async function renameTab(
  tabId: string,
  name: string
): Promise<ActionState> {
  const tab = await prisma.projectTab.findUnique({
    where: { id: tabId },
    select: { projectId: true, feature: true },
  })
  if (!tab) return { error: "Tab not found." }
  await requireProjectEditor(tab.projectId)

  const clean = name.trim()
  if (!clean) return { error: "Tab name is required." }

  const dupe = await prisma.projectTab.findFirst({
    where: {
      projectId: tab.projectId,
      feature: tab.feature,
      name: { equals: clean, mode: "insensitive" },
      id: { not: tabId },
    },
    select: { id: true },
  })
  if (dupe) return { error: `"${clean}" already exists.` }

  await prisma.projectTab.update({ where: { id: tabId }, data: { name: clean } })
  await revalidateProject(tab.projectId)
  return { success: true }
}

/**
 * Delete a tab. Any docs/envs/readmes filed under it have their `tabId` set to
 * null automatically (FK onDelete: SetNull), so their content is never lost —
 * they simply become uncategorized.
 */
export async function deleteTab(tabId: string): Promise<ActionState> {
  const tab = await prisma.projectTab.findUnique({
    where: { id: tabId },
    select: { projectId: true },
  })
  if (!tab) return { error: "Tab not found." }
  await requireProjectEditor(tab.projectId)

  await prisma.projectTab.delete({ where: { id: tabId } })
  await revalidateProject(tab.projectId)
  return { success: true }
}
