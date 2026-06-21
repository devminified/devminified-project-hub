"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/dal"
import type { Component } from "@/lib/projects/types"
import {
  asComponent,
  revalidateProject,
  type ActionState,
} from "./helpers"

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
