/**
 * Shared, non-action helpers for the project server actions. This module is
 * intentionally NOT a "use server" file so it can export types and synchronous
 * utilities; the "use server" action files import from here.
 */
import { revalidatePath, revalidateTag } from "next/cache"

import { prisma } from "@/lib/prisma"
import { projectTag } from "@/lib/projects/queries"
import type { Component, EnvScope, ProjectStatus } from "@/lib/projects/types"

export type ActionState = { error?: string; success?: boolean }

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function asStatus(value: FormDataEntryValue | null): ProjectStatus {
  if (value === "Production" || value === "Staging") return value
  return "Development"
}

export function asScope(value: FormDataEntryValue | null): EnvScope {
  if (value === "Production" || value === "Preview") return value
  return "Development"
}

export function asComponent(value: FormDataEntryValue | null): Component | null {
  if (value === "FRONTEND" || value === "BACKEND" || value === "DB") return value
  return null
}

/** A project tab id from a form field, or null for "none"/empty. */
export function asTabId(value: FormDataEntryValue | null): string | null {
  const s = String(value ?? "").trim()
  return s && s !== "none" ? s : null
}

export function parseTags(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
}

/**
 * Invalidate a project's cached reads (summary + all tabs) and re-render its
 * detail page. Call after any mutation that changes the project or its
 * envs/docs/readmes.
 */
export async function revalidateProject(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { slug: true },
  })
  if (project) {
    // `{ expire: 0 }` expires immediately so the editing admin sees their change
    // right away (read-your-own-writes) rather than stale-while-revalidate.
    revalidateTag(projectTag(project.slug), { expire: 0 })
    revalidatePath(`/projects/${project.slug}`)
  }
}
