/**
 * Shared, framework-agnostic types for the Projects feature.
 * Safe to import from both server and client modules (no runtime deps).
 */

export type Component = "FRONTEND" | "BACKEND" | "DB"
export type ProjectStatus = "Production" | "Staging" | "Development"
export type EnvScope = "Production" | "Preview" | "Development"

/** The four workspace tabs, also used as the `?tab=` query value. */
export type TabKey = "details" | "envs" | "docs" | "readmes"
export const TAB_KEYS: TabKey[] = ["details", "envs", "docs", "readmes"]

/** A single label/value detail. `value` may be a URL (rendered as a link) or any text. */
export type DetailItem = { label: string; value: string }
/** An admin-defined heading with any number of detail items below it. */
export type DetailSection = { heading: string; items: DetailItem[] }

export type EnvRecord = {
  id: string
  key: string
  value: string
  scope: EnvScope
  component: Component | null
}

export type DocRecord = {
  id: string
  title: string
  description: string
  component: Component | null
  updatedAt: string
}

export type ReadmeRecord = {
  id: string
  title: string
  content: string
  component: Component | null
}

/** Lightweight row for the dashboard list — scalar columns only, no relations. */
export type ProjectListItem = {
  id: string // slug, used for routing
  name: string
  status: ProjectStatus
  description: string
  tags: string[]
  imageUrl: string | null
  updatedAt: string
}

export type ProjectCounts = { envs: number; docs: number; readmes: number }

/**
 * Everything the detail page needs up front: scalar fields, detail sections,
 * and relation counts — but NOT the (potentially large) relation rows, which
 * are fetched per active tab.
 */
export type ProjectSummary = {
  id: string // database id
  slug: string
  name: string
  description: string
  status: ProjectStatus
  tags: string[]
  imageUrl: string | null
  detailSections: DetailSection[]
  updatedAt: string
  counts: ProjectCounts
}
