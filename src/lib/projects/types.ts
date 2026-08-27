/**
 * Shared, framework-agnostic types for the Projects feature.
 * Safe to import from both server and client modules (no runtime deps).
 */

export type Component = "FRONTEND" | "BACKEND" | "DB"
export type ProjectStatus = "Production" | "Staging" | "Development"
export type EnvScope = "Production" | "Preview" | "Development"

/**
 * The features that each carry their own independent set of tabs. Envs have
 * two dimensions: `ENV` (component) and `ENV_SCOPE` (the Prod/Preview/Dev row).
 *
 * Kept as a runtime array with the type derived from it, so server-side
 * validation can check membership against this list rather than restating it.
 * Restating it is how `ENV_SCOPE` came to be a valid type but a rejected value.
 * Mirrors `enum TabFeature` in prisma/schema.prisma.
 */
export const TAB_FEATURES = ["DOC", "ENV", "ENV_SCOPE", "README"] as const
export type TabFeature = (typeof TAB_FEATURES)[number]

/** A project-specific, editable tab (category) for one feature. */
export type ProjectTab = {
  id: string
  name: string
  order: number
}

/**
 * The workspace tabs, also used as the `?tab=` query value. `secrets` is
 * admin-only — it is rendered in the tab bar and accepted by the panel router
 * exclusively for admins (enforced server-side).
 */
export type TabKey = "details" | "envs" | "docs" | "readmes" | "secrets"
export const TAB_KEYS: TabKey[] = ["details", "envs", "docs", "readmes", "secrets"]

/** A single label/value detail. `value` may be a URL (rendered as a link) or any text. */
export type DetailItem = { label: string; value: string }
/** An admin-defined heading with any number of detail items below it. */
export type DetailSection = { heading: string; items: DetailItem[] }

/**
 * A Details-tab entry: either a `{label,value}` pair, or a freeform text note
 * (a plain string). Secrets sections stay strictly `DetailItem` — see
 * `DetailSection` above.
 */
export type DetailEntry = DetailItem | string
/** A Details-tab heading with any number of label/value pairs or text notes. */
export type RichDetailSection = { heading: string; items: DetailEntry[] }

export type EnvRecord = {
  id: string
  key: string
  value: string
  tabId: string | null
  scopeTabId: string | null
}

export type DocRecord = {
  id: string
  title: string
  description: string
  tabId: string | null
  updatedAt: string
  // Set when the doc is a file upload (PDF / Word): Cloudinary URL + mime type.
  fileUrl: string | null
  fileType: string | null
}

export type ReadmeRecord = {
  id: string
  title: string
  content: string
  tabId: string | null
  // Set when the readme is a file upload (PDF / Word): Cloudinary URL + mime type.
  fileUrl: string | null
  fileType: string | null
}

/** Lightweight row for the dashboard list — scalar columns only, no relations. */
export type ProjectListItem = {
  id: string // slug, used for routing
  name: string
  status: ProjectStatus
  // True when the project is archived (hidden from the main listing).
  archived: boolean
  description: string
  tags: string[]
  // A ready-to-use, small image src (optimized Cloudinary URL or the cacheable
  // image route) — never inline base64. Null when the project has no image.
  imageUrl: string | null
  updatedAt: string
}

export type ProjectCounts = {
  envs: number
  docs: number
  readmes: number
  members: number
}

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
  archived: boolean
  tags: string[]
  imageUrl: string | null
  detailSections: RichDetailSection[]
  updatedAt: string
  counts: ProjectCounts
}
