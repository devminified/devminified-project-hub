"use client"

import { FileText } from "lucide-react"

import { uploadProjectDocument } from "@/app/(app)/projects/actions"
import { fileKind, isDocumentFile } from "./utils"

/**
 * A file the user picked in an upload dialog, pre-classified as either inline
 * text (content read client-side) or a binary document (PDF / Word) that must
 * be uploaded to storage on submit.
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

/** Read a picked file: text is inlined; PDF/Word is held for upload on submit. */
export async function prepareFile(f: File): Promise<PreparedFile> {
  if (isDocumentFile(f.name)) {
    return { title: f.name, content: "", file: f, isDoc: true, bytes: f.size }
  }
  return {
    title: f.name,
    content: await f.text(),
    file: null,
    isDoc: false,
    bytes: f.size,
  }
}

/**
 * Upload any binary documents to storage and return the entries ready to
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
                ? `${fileKind(f.title, null) === "pdf" ? "PDF" : "Word"} · ${formatBytes(f.bytes)}`
                : `${f.content.length} chars`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
