"use server"

import { prisma } from "@/lib/prisma"
import { requireProjectEditor } from "@/lib/dal"
import {
  asTabId,
  revalidateProject,
  type ActionState,
} from "./helpers"

/**
 * An env var is identified by its key *within* one tab + scope combination, so
 * the same key may legitimately exist under Production and Development. Returns
 * the row occupying that slot, if any.
 */
async function findEnvSlot(
  projectId: string,
  key: string,
  tabId: string | null,
  scopeTabId: string | null
) {
  return prisma.envVar.findFirst({
    where: { projectId, key, tabId, scopeTabId },
    select: { id: true },
  })
}

export async function createEnv(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "")
  await requireProjectEditor(projectId)
  const key = String(formData.get("key") ?? "").trim()
  if (!projectId || !key) return { error: "Key is required." }

  const value = String(formData.get("value") ?? "")
  const tabId = asTabId(formData.get("tabId"))
  const scopeTabId = asTabId(formData.get("scopeTabId"))

  // Adding a key that already exists in this tab + scope means the editor wants
  // that variable to hold a new value — update it in place rather than leaving
  // two rows with the same key behind.
  const existing = await findEnvSlot(projectId, key, tabId, scopeTabId)
  if (existing) {
    await prisma.envVar.update({ where: { id: existing.id }, data: { value } })
  } else {
    await prisma.envVar.create({
      data: { projectId, key, value, tabId, scopeTabId },
    })
  }
  await revalidateProject(projectId)
  return { success: true }
}

/**
 * Parse a pasted .env block into entries. A key repeated inside the block keeps
 * its last value — a single paste must never yield two rows for one key.
 */
function parseEnvBlock(raw: string): { key: string; value: string }[] {
  const out = new Map<string, string>()
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
    out.set(key, value)
  }
  return [...out].map(([key, value]) => ({ key, value }))
}

export async function createEnvsBulk(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "")
  await requireProjectEditor(projectId)
  const tabId = asTabId(formData.get("tabId"))
  const scopeTabId = asTabId(formData.get("scopeTabId"))
  const entries = parseEnvBlock(String(formData.get("raw") ?? ""))

  if (!projectId) return { error: "Missing project." }
  if (entries.length === 0) {
    return { error: "No valid KEY=VALUE lines found." }
  }

  const existing = await prisma.envVar.findMany({
    where: { projectId, tabId, scopeTabId },
    select: { key: true },
  })
  const existingKeys = new Set(existing.map((e) => e.key))

  // `updateMany` rather than a per-id update: projects that collected duplicate
  // rows for one key under the old create-always behavior get every copy set to
  // the pasted value, instead of one copy silently keeping a stale one.
  await prisma.$transaction(
    entries.map((e) =>
      existingKeys.has(e.key)
        ? prisma.envVar.updateMany({
            where: { projectId, tabId, scopeTabId, key: e.key },
            data: { value: e.value },
          })
        : prisma.envVar.create({
            data: { projectId, key: e.key, value: e.value, tabId, scopeTabId },
          })
    )
  )
  await revalidateProject(projectId)
  return { success: true }
}

export async function updateEnv(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "")
  const key = String(formData.get("key") ?? "").trim()
  if (!id || !key) return { error: "Key is required." }

  const existing = await prisma.envVar.findUnique({
    where: { id },
    select: { projectId: true },
  })
  if (!existing) return { error: "Variable not found." }
  await requireProjectEditor(existing.projectId)

  const tabId = asTabId(formData.get("tabId"))
  const scopeTabId = asTabId(formData.get("scopeTabId"))

  // Renaming (or re-scoping) onto a slot another row already holds would leave
  // two rows sharing a key. Say so instead of silently duplicating.
  const clash = await findEnvSlot(existing.projectId, key, tabId, scopeTabId)
  if (clash && clash.id !== id) {
    return { error: `${key} already exists in this tab and scope.` }
  }

  const env = await prisma.envVar.update({
    where: { id },
    data: {
      key,
      value: String(formData.get("value") ?? ""),
      tabId,
      scopeTabId,
    },
  })
  await revalidateProject(env.projectId)
  return { success: true }
}

export async function deleteEnv(id: string): Promise<ActionState> {
  const existing = await prisma.envVar.findUnique({
    where: { id },
    select: { projectId: true },
  })
  if (!existing) return { error: "Variable not found." }
  await requireProjectEditor(existing.projectId)
  const env = await prisma.envVar.delete({ where: { id } })
  await revalidateProject(env.projectId)
  return { success: true }
}
