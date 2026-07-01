"use client"

import { Download, FileText } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { fileKind } from "./utils"

export type FileRecordKind = "doc" | "readme"

/** Our own streaming route for a file-backed record (used for PDFs). */
function proxyPath(kind: FileRecordKind, id: string, download = false) {
  return `/files?kind=${kind}&rid=${id}${download ? "&download=1" : ""}`
}

/**
 * Resolve the URLs used to preview and open/download a file-backed record.
 * - PDF: served through our route (Cloudinary blocks raw PDF delivery).
 * - Word: previewed via the Microsoft Office online viewer over the public
 *   Cloudinary URL, and opened/downloaded directly.
 */
export function fileLinks(
  kind: FileRecordKind,
  id: string,
  fileUrl: string,
  fileType: string | null | undefined,
  title: string
): { preview: string | null; open: string; docKind: "pdf" | "word" | null } {
  const docKind = fileKind(title, fileType)
  if (docKind === "pdf") {
    return { preview: proxyPath(kind, id), open: proxyPath(kind, id, true), docKind }
  }
  if (docKind === "word") {
    const viewer = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`
    return { preview: viewer, open: fileUrl, docKind }
  }
  return { preview: null, open: fileUrl, docKind }
}

/**
 * Inline preview of an uploaded document file. PDFs render in a native iframe
 * (via our streaming route); Word docs render through the Office online viewer.
 * Anything without a previewer falls back to an open/download prompt.
 */
export function FilePreview({
  kind,
  id,
  fileUrl,
  fileType,
  title,
  className,
}: {
  kind: FileRecordKind
  id: string
  fileUrl: string
  fileType?: string | null
  title: string
  className?: string
}) {
  const { preview, open } = fileLinks(kind, id, fileUrl, fileType, title)

  if (preview) {
    return (
      <iframe
        src={preview}
        title={title}
        className={cn("w-full rounded-lg border border-slate-200 bg-white", className)}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center",
        className
      )}
    >
      <FileText className="size-8 text-slate-400" />
      <p className="text-sm text-slate-500">Preview isn&apos;t available for this file.</p>
      <FileOpenButton href={open} />
    </div>
  )
}

/** Opens the file in a new tab / downloads it. */
export function FileOpenButton({
  href,
  label = "Open file",
  className,
}: {
  href: string
  label?: string
  className?: string
}) {
  return (
    <Button
      type="button"
      onClick={() => window.open(href, "_blank", "noopener,noreferrer")}
      className={cn("gap-1.5 bg-[var(--brand-primary)] text-white", className)}
    >
      <Download className="size-4" />
      {label}
    </Button>
  )
}
