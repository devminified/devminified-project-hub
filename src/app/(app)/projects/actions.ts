"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/dal"

export type ActionState = { error?: string; success?: boolean }

type ProjectStatus = "Production" | "Staging" | "Development"
type EnvScope = "Production" | "Preview" | "Development"

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function asStatus(value: FormDataEntryValue | null): ProjectStatus {
  if (value === "Production" || value === "Staging") return value
  return "Development"
}

function asScope(value: FormDataEntryValue | null): EnvScope {
  if (value === "Production" || value === "Preview") return value
  return "Development"
}

type Component = "FRONTEND" | "BACKEND" | "DB"

function asComponent(value: FormDataEntryValue | null): Component | null {
  if (value === "FRONTEND" || value === "BACKEND" || value === "DB") return value
  return null
}

function asUrl(value: FormDataEntryValue | null): string | null {
  const url = String(value ?? "").trim()
  return url || null
}

function parseTags(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
}

/* ----------------------------- Projects ----------------------------- */

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
      productionUrl: asUrl(formData.get("productionUrl")),
      stagingUrl: asUrl(formData.get("stagingUrl")),
    },
  })

  revalidatePath("/")
  return { success: true }
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
      productionUrl: asUrl(formData.get("productionUrl")),
      stagingUrl: asUrl(formData.get("stagingUrl")),
    },
  })

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

/* ------------------------------- ENVs ------------------------------- */

export async function createEnv(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin()
  const projectId = String(formData.get("projectId") ?? "")
  const key = String(formData.get("key") ?? "").trim()
  if (!projectId || !key) return { error: "Key is required." }

  await prisma.envVar.create({
    data: {
      projectId,
      key,
      value: String(formData.get("value") ?? ""),
      scope: asScope(formData.get("scope")),
      component: asComponent(formData.get("component")),
    },
  })
  await revalidateProject(projectId)
  return { success: true }
}

function parseEnvBlock(raw: string): { key: string; value: string }[] {
  const out: { key: string; value: string }[] = []
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    if (!key) continue
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out.push({ key, value })
  }
  return out
}

export async function createEnvsBulk(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin()
  const projectId = String(formData.get("projectId") ?? "")
  const scope = asScope(formData.get("scope"))
  const component = asComponent(formData.get("component"))
  const entries = parseEnvBlock(String(formData.get("raw") ?? ""))

  if (!projectId) return { error: "Missing project." }
  if (entries.length === 0) {
    return { error: "No valid KEY=VALUE lines found." }
  }

  await prisma.envVar.createMany({
    data: entries.map((e) => ({ projectId, key: e.key, value: e.value, scope, component })),
  })
  await revalidateProject(projectId)
  return { success: true }
}

export async function updateEnv(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin()
  const id = String(formData.get("id") ?? "")
  const key = String(formData.get("key") ?? "").trim()
  if (!id || !key) return { error: "Key is required." }

  const env = await prisma.envVar.update({
    where: { id },
    data: {
      key,
      value: String(formData.get("value") ?? ""),
      scope: asScope(formData.get("scope")),
      component: asComponent(formData.get("component")),
    },
  })
  await revalidateProject(env.projectId)
  return { success: true }
}

export async function deleteEnv(id: string): Promise<ActionState> {
  await requireAdmin()
  const env = await prisma.envVar.delete({ where: { id } })
  await revalidateProject(env.projectId)
  return { success: true }
}

/* ------------------------------- Docs ------------------------------- */

export async function createDoc(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin()
  const projectId = String(formData.get("projectId") ?? "")
  const title = String(formData.get("title") ?? "").trim()
  if (!projectId || !title) return { error: "Title is required." }

  await prisma.doc.create({
    data: {
      projectId,
      title,
      description: String(formData.get("description") ?? "").trim(),
      component: asComponent(formData.get("component")),
    },
  })
  await revalidateProject(projectId)
  return { success: true }
}

export async function createDocsBulk(
  projectId: string,
  files: { title: string; content: string }[],
  component: Component | null = null
): Promise<ActionState> {
  await requireAdmin()
  if (!projectId) return { error: "Missing project." }

  const clean = files
    .map((f) => ({ title: f.title.trim(), content: f.content }))
    .filter((f) => f.title)
  if (clean.length === 0) return { error: "No files selected." }

  await prisma.doc.createMany({
    data: clean.map((f) => ({
      projectId,
      title: f.title,
      description: f.content,
      component,
    })),
  })
  await revalidateProject(projectId)
  return { success: true }
}

export async function updateDoc(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin()
  const id = String(formData.get("id") ?? "")
  const title = String(formData.get("title") ?? "").trim()
  if (!id || !title) return { error: "Title is required." }

  const doc = await prisma.doc.update({
    where: { id },
    data: {
      title,
      description: String(formData.get("description") ?? "").trim(),
      component: asComponent(formData.get("component")),
    },
  })
  await revalidateProject(doc.projectId)
  return { success: true }
}

export async function deleteDoc(id: string): Promise<ActionState> {
  await requireAdmin()
  const doc = await prisma.doc.delete({ where: { id } })
  await revalidateProject(doc.projectId)
  return { success: true }
}

/* ------------------------------ READMEs ----------------------------- */

export async function createReadme(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin()
  const projectId = String(formData.get("projectId") ?? "")
  const title = String(formData.get("title") ?? "").trim()
  if (!projectId || !title) return { error: "Title is required." }

  await prisma.readme.create({
    data: {
      projectId,
      title,
      content: String(formData.get("content") ?? ""),
      component: asComponent(formData.get("component")),
    },
  })
  await revalidateProject(projectId)
  return { success: true }
}

export async function createReadmesBulk(
  projectId: string,
  files: { title: string; content: string }[],
  component: Component | null = null
): Promise<ActionState> {
  await requireAdmin()
  if (!projectId) return { error: "Missing project." }

  const clean = files
    .map((f) => ({ title: f.title.trim(), content: f.content }))
    .filter((f) => f.title)
  if (clean.length === 0) return { error: "No files selected." }

  await prisma.readme.createMany({
    data: clean.map((f) => ({ projectId, title: f.title, content: f.content, component })),
  })
  await revalidateProject(projectId)
  return { success: true }
}

export async function updateReadme(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin()
  const id = String(formData.get("id") ?? "")
  const title = String(formData.get("title") ?? "").trim()
  if (!id || !title) return { error: "Title is required." }

  const readme = await prisma.readme.update({
    where: { id },
    data: {
      title,
      content: String(formData.get("content") ?? ""),
      component: asComponent(formData.get("component")),
    },
  })
  await revalidateProject(readme.projectId)
  return { success: true }
}

export async function deleteReadme(id: string): Promise<ActionState> {
  await requireAdmin()
  const readme = await prisma.readme.delete({ where: { id } })
  await revalidateProject(readme.projectId)
  return { success: true }
}

/* ------------------------------ helpers ----------------------------- */

async function revalidateProject(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { slug: true },
  })
  if (project) revalidatePath(`/projects/${project.slug}`)
}
