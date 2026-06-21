"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/dal"
import {
  asComponent,
  asScope,
  revalidateProject,
  type ActionState,
} from "./helpers"

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
    data: entries.map((e) => ({
      projectId,
      key: e.key,
      value: e.value,
      scope,
      component,
    })),
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
