"use client"

import { FileText } from "lucide-react"

import { uploadProjectDocument } from "@/app/(app)/projects/actions"
import { fileTypeLabel, isDocumentFile } from "./utils"

/**
 * A file the user picked in an upload dialog, pre-classified as either inline
 * text (content read client-side) or a file (PDF / Word, binary, or very large
 * text) that must be uploaded to storage on submit.
 */
export type PreparedFile = {
  title: string
  content: string
  file: File | null
  isDoc: boolean
  bytes: number
}

/** The shape persisted by `createDocsBulk` / `createReadmesBulk`. */
export type PreparedEntry = {
  title: string
  content: string
  fileUrl?: string | null
  fileType?: string | null
}

/** Largest file accepted; matches the limit in `uploadProjectDocument`. */
const MAX_FILE_BYTES = 15 * 1024 * 1024 // 15 MB

/** Largest text file we inline; bigger ones are stored as files instead. */
const MAX_TEXT_BYTES = 10 * 1024 * 1024 // 10 MB

/**
 * True when decoded content isn't storable/viewable text: NUL bytes (which
 * Postgres text columns reject) or U+FFFD from bytes that aren't valid UTF-8.
 */
function looksBinary(content: string) {
  return content.includes("\u0000") || content.includes("�")
}

/**
 * Read a picked file of any type: text is inlined; PDF/Word, binary and very
 * large files are held for upload on submit. Throws with a user-facing message
 * when the file is over the size limit.
 */
export async function prepareFile(f: File): Promise<PreparedFile> {
  if (f.size > MAX_FILE_BYTES) {
    throw new Error(`${f.name} is too large. Files must be under 15 MB.`)
  }
  const asUpload = { title: f.name, content: "", file: f, isDoc: true, bytes: f.size }
  if (isDocumentFile(f.name) || f.size > MAX_TEXT_BYTES) return asUpload
  const content = await f.text()
  if (looksBinary(content)) return asUpload
  return {
    title: f.name,
    content,
    file: null,
    isDoc: false,
    bytes: f.size,
  }
}

/**
 * Upload any non-inline files to storage and return the entries ready to
 * persist. Text files pass through unchanged. Stops at the first upload error.
 */
export async function uploadPreparedFiles(
  files: PreparedFile[],
  projectId: string
): Promise<{ error?: string; entries: PreparedEntry[] }> {
  const entries: PreparedEntry[] = []
  for (const item of files) {
    if (item.isDoc && item.file) {
      const fd = new FormData()
      fd.set("projectId", projectId)
      fd.set("file", item.file)
      const up = await uploadProjectDocument(fd)
      if (up.error || !up.url) {
        return { error: up.error ?? "Upload failed.", entries: [] }
      }
      entries.push({
        title: item.title,
        content: "",
        fileUrl: up.url,
        fileType: up.fileType ?? null,
      })
    } else {
      entries.push({ title: item.title, content: item.content })
    }
  }
  return { entries }
}

/** Format a byte count as a compact, human-readable size. */
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Preview list of the files staged for upload. */
export function PreparedFileList({ files }: { files: PreparedFile[] }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {files.length} {files.length === 1 ? "file" : "files"} ready
      </p>
      <ul className="max-h-40 space-y-1 overflow-y-auto">
        {files.map((f, i) => (
          <li
            key={`${f.title}-${i}`}
            className="flex items-center gap-2 rounded-md bg-slate-50 px-2.5 py-1.5 text-sm text-slate-700"
          >
            <FileText className="size-3.5 shrink-0 text-blue-500" />
            <span className="truncate">{f.title}</span>
            <span className="ml-auto shrink-0 text-xs text-slate-400">
              {f.isDoc
                ? `${fileTypeLabel(f.title, null)} · ${formatBytes(f.bytes)}`
                : `${f.content.length} chars`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
