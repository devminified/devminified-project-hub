"use server"

import { revalidatePath, revalidateTag } from "next/cache"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/dal"
import { projectTag } from "@/lib/projects/queries"
import type { DetailSection } from "@/lib/projects/types"
import type { ActionState } from "./helpers"

/**
 * Replace a project's admin-only secret sections (headings + label/value items).
 * Mirrors `updateProjectDetails`, but writes the separate `secretSections`
 * column and is hard-gated to admins.
 */
export async function updateProjectSecrets(
  projectId: string,
  sections: DetailSection[]
): Promise<ActionState> {
  await requireAdmin()
  if (!projectId) return { error: "Missing project." }

  // Trim everything, drop blank items, then drop sections with no heading and no items.
  const clean = sections
    .map((section) => ({
      heading: String(section.heading ?? "").trim(),
      items: (section.items ?? [])
        .map((item) => ({
          label: String(item.label ?? "").trim(),
          value: String(item.value ?? "").trim(),
        }))
        .filter((item) => item.label || item.value),
    }))
    .filter((section) => section.heading || section.items.length > 0)

  const project = await prisma.project.update({
    where: { id: projectId },
    data: { secretSections: clean },
  })

  revalidateTag(projectTag(project.slug), { expire: 0 })
  revalidatePath(`/projects/${project.slug}`)
  return { success: true }
}
