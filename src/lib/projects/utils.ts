/**
 * Pure helpers for shaping project data. No server/client-only imports, so this
 * module is safe to use anywhere.
 */
import type { DetailItem, DetailSection } from "./types"

/** Format a Date as an ISO `YYYY-MM-DD` string for display. */
export function toUpdatedAt(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/**
 * Coerce the project's `detailSections` JSON column into the typed shape,
 * tolerating older `links`/`url` data that predates the generic `items`/`value`
 * shape. Anything malformed is dropped rather than throwing.
 */
export function parseDetailSections(value: unknown): DetailSection[] {
  if (!Array.isArray(value)) return []
  return value
    .map((section): DetailSection | null => {
      if (!section || typeof section !== "object") return null
      const s = section as Record<string, unknown>
      const heading = typeof s.heading === "string" ? s.heading : ""
      const rawItems = Array.isArray(s.items)
        ? s.items
        : Array.isArray(s.links)
          ? s.links
          : []
      const items = rawItems
        .map((item): DetailItem | null => {
          if (!item || typeof item !== "object") return null
          const i = item as Record<string, unknown>
          const label = typeof i.label === "string" ? i.label : ""
          const value =
            typeof i.value === "string"
              ? i.value
              : typeof i.url === "string"
                ? i.url
                : ""
          if (!label && !value) return null
          return { label, value }
        })
        .filter((i): i is DetailItem => i !== null)
      if (!heading && items.length === 0) return null
      return { heading, items }
    })
    .filter((s): s is DetailSection => s !== null)
}

/** First letter of a project name, for avatar fallbacks. */
export function projectInitial(name: string): string {
  return (name.trim()[0] ?? "·").toUpperCase()
}

/**
 * Resolve a small, fast image `src` for a project avatar from the stored
 * `imageUrl`, never returning heavy inline data:
 * - Cloudinary URL → inject resize/format/quality transforms (optimized + CDN).
 * - legacy base64 data URL → the cacheable `/projects/[slug]/image` route.
 * - any other (external) URL → used as-is.
 * Returns null when there is no image.
 */
export function projectImageSrc(
  imageUrl: string | null,
  slug: string,
  version: string,
  size: number
): string | null {
  if (!imageUrl) return null

  if (
    imageUrl.includes("res.cloudinary.com") &&
    imageUrl.includes("/image/upload/")
  ) {
    const transforms = `c_fill,g_auto,f_auto,q_auto,dpr_2,w_${size},h_${size}`
    return imageUrl.replace("/image/upload/", `/image/upload/${transforms}/`)
  }

  if (imageUrl.startsWith("data:")) {
    return `/projects/${slug}/image?v=${encodeURIComponent(version)}`
  }

  return imageUrl
}

/** Normalize an arbitrary `?tab=` value into a known tab key. */
export function normalizeTab(value: string | string[] | undefined): import("./types").TabKey {
  const tab = Array.isArray(value) ? value[0] : value
  return tab === "envs" ||
    tab === "docs" ||
    tab === "readmes" ||
    tab === "secrets"
    ? tab
    : "details"
}
