/** Shared presentational constants and helpers for the project workspace. */

export const textareaClass =
  "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export const scopeStyles: Record<string, string> = {
  Production: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Preview: "bg-amber-50 text-amber-700 ring-amber-200",
  Development: "bg-blue-50 text-blue-700 ring-blue-200",
}

/** True when a detail value should render as a clickable link. */
export function isUrl(value: string) {
  return /^https?:\/\//i.test(value.trim())
}

/** Ensure a downloaded file has an extension, defaulting to `.md`. */
export function ensureFileName(title: string) {
  return /\.[a-z0-9]+$/i.test(title.trim())
    ? title.trim()
    : `${title.trim() || "file"}.md`
}

/** Trigger a client-side download of `content` named after `title`. */
export function downloadText(title: string, content: string) {
  const blob = new Blob([content ?? ""], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = ensureFileName(title)
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
