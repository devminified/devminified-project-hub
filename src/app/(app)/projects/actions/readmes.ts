"use server"

import { prisma } from "@/lib/prisma"
import { requireProjectEditor } from "@/lib/dal"
import type { Component } from "@/lib/projects/types"
import {
  asComponent,
  revalidateProject,
  type ActionState,
} from "./helpers"

export async function createReadme(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "")
  await requireProjectEditor(projectId)
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
  await requireProjectEditor(projectId)
  if (!projectId) return { error: "Missing project." }

  const clean = files
    .map((f) => ({ title: f.title.trim(), content: f.content }))
    .filter((f) => f.title)
  if (clean.length === 0) return { error: "No files selected." }

  await prisma.readme.createMany({
    data: clean.map((f) => ({
      projectId,
      title: f.title,
      content: f.content,
      component,
    })),
  })
  await revalidateProject(projectId)
  return { success: true }
}

export async function updateReadme(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "")
  const title = String(formData.get("title") ?? "").trim()
  if (!id || !title) return { error: "Title is required." }

  const existing = await prisma.readme.findUnique({
    where: { id },
    select: { projectId: true },
  })
  if (!existing) return { error: "README not found." }
  await requireProjectEditor(existing.projectId)

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
  const existing = await prisma.readme.findUnique({
    where: { id },
    select: { projectId: true },
  })
  if (!existing) return { error: "README not found." }
  await requireProjectEditor(existing.projectId)
  const readme = await prisma.readme.delete({ where: { id } })
  await revalidateProject(readme.projectId)
  return { success: true }
}
