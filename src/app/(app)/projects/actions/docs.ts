"use server"

import { prisma } from "@/lib/prisma"
import { requireProjectEditor } from "@/lib/dal"
import {
  asTabId,
  revalidateProject,
  type ActionState,
} from "./helpers"

export async function createDoc(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "")
  await requireProjectEditor(projectId)
  const title = String(formData.get("title") ?? "").trim()
  if (!projectId || !title) return { error: "Title is required." }

  await prisma.doc.create({
    data: {
      projectId,
      title,
      description: String(formData.get("description") ?? "").trim(),
      tabId: asTabId(formData.get("tabId")),
    },
  })
  await revalidateProject(projectId)
  return { success: true }
}

export async function createDocsBulk(
  projectId: string,
  files: {
    title: string
    content: string
    fileUrl?: string | null
    fileType?: string | null
  }[],
  tabId: string | null = null
): Promise<ActionState> {
  await requireProjectEditor(projectId)
  if (!projectId) return { error: "Missing project." }

  const clean = files
    .map((f) => ({
      title: f.title.trim(),
      content: f.content,
      fileUrl: f.fileUrl ?? null,
      fileType: f.fileType ?? null,
    }))
    .filter((f) => f.title)
  if (clean.length === 0) return { error: "No files selected." }

  await prisma.doc.createMany({
    data: clean.map((f) => ({
      projectId,
      title: f.title,
      description: f.content,
      fileUrl: f.fileUrl,
      fileType: f.fileType,
      tabId,
    })),
  })
  await revalidateProject(projectId)
  return { success: true }
}

export async function updateDoc(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "")
  const title = String(formData.get("title") ?? "").trim()
  if (!id || !title) return { error: "Title is required." }

  const existing = await prisma.doc.findUnique({
    where: { id },
    select: { projectId: true },
  })
  if (!existing) return { error: "Document not found." }
  await requireProjectEditor(existing.projectId)

  const doc = await prisma.doc.update({
    where: { id },
    data: {
      title,
      description: String(formData.get("description") ?? "").trim(),
      tabId: asTabId(formData.get("tabId")),
    },
  })
  await revalidateProject(doc.projectId)
  return { success: true }
}

export async function deleteDoc(id: string): Promise<ActionState> {
  const existing = await prisma.doc.findUnique({
    where: { id },
    select: { projectId: true },
  })
  if (!existing) return { error: "Document not found." }
  await requireProjectEditor(existing.projectId)
  const doc = await prisma.doc.delete({ where: { id } })
  await revalidateProject(doc.projectId)
  return { success: true }
}
