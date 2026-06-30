"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { requireAdmin, requireProjectEditor } from "@/lib/dal"
import { projectTag } from "@/lib/projects/queries"
import type { DetailSection } from "@/lib/projects/types"
import {
  asStatus,
  parseTags,
  slugify,
  type ActionState,
} from "./helpers"

export async function createProject(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin()

  const name = String(formData.get("name") ?? "").trim()
  if (!name) return { error: "Project name is required." }

  let slug = slugify(name)
  if (!slug) return { error: "Project name must contain letters or numbers." }

  // Ensure a unique slug.
  const existing = await prisma.project.findUnique({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`

  await prisma.project.create({
    data: {
      slug,
      name,
      description: String(formData.get("description") ?? "").trim(),
      status: asStatus(formData.get("status")),
      tags: parseTags(formData.get("tags")),
      imageUrl: String(formData.get("imageUrl") ?? "").trim() || null,
      // Seed each feature with the default Frontend/Backend/DB tabs. These are
      // fully editable per project afterwards.
      tabs: { create: defaultTabsSeed() },
    },
  })

  revalidatePath("/")
  return { success: true }
}

/** The default tabs every new project starts with, for each feature. */
function defaultTabsSeed() {
  const features = ["DOC", "ENV", "README"] as const
  const names = ["Frontend", "Backend", "DB"]
  return features.flatMap((feature) =>
    names.map((name, order) => ({ feature, name, order }))
  )
}

export async function updateProject(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin()

  const id = String(formData.get("id") ?? "")
  const name = String(formData.get("name") ?? "").trim()
  if (!id || !name) return { error: "Project name is required." }

  const project = await prisma.project.update({
    where: { id },
    data: {
      name,
      description: String(formData.get("description") ?? "").trim(),
      status: asStatus(formData.get("status")),
      tags: parseTags(formData.get("tags")),
      imageUrl: String(formData.get("imageUrl") ?? "").trim() || null,
    },
  })

  revalidateTag(projectTag(project.slug), { expire: 0 })
  revalidatePath("/")
  revalidatePath(`/projects/${project.slug}`)
  return { success: true }
}

/** Replace a project's dynamic detail sections (headings + label/value items). */
export async function updateProjectDetails(
  projectId: string,
  sections: DetailSection[]
): Promise<ActionState> {
  if (!projectId) return { error: "Missing project." }
  await requireProjectEditor(projectId)

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
    data: { detailSections: clean },
  })

  revalidateTag(projectTag(project.slug), { expire: 0 })
  revalidatePath("/")
  revalidatePath(`/projects/${project.slug}`)
  return { success: true }
}

export async function deleteProject(id: string): Promise<void> {
  await requireAdmin()
  await prisma.project.delete({ where: { id } })
  revalidatePath("/")
  redirect("/")
}
