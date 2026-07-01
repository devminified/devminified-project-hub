"use server"

import { requireProjectEditor } from "@/lib/dal"
import { uploadProjectFile } from "@/lib/cloudinary"

export type FileUploadResult = {
  url?: string
  fileType?: string
  name?: string
  error?: string
}

const MAX_BYTES = 15 * 1024 * 1024 // 15 MB

/** MIME types accepted for document uploads (PDF and Word). */
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
])

/** Extensions accepted, as a fallback when the browser omits a reliable type. */
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"]

function hasAllowedExtension(name: string) {
  const lower = name.toLowerCase()
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

/**
 * Upload a single PDF / Word document to Cloudinary and return its delivery URL.
 * Gated to project editors; the browser sends the raw file and the API secret
 * never leaves the server.
 */
export async function uploadProjectDocument(
  formData: FormData
): Promise<FileUploadResult> {
  const projectId = String(formData.get("projectId") ?? "")
  await requireProjectEditor(projectId)

  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file selected." }
  }
  if (!ALLOWED_TYPES.has(file.type) && !hasAllowedExtension(file.name)) {
    return { error: "File must be a PDF or Word document." }
  }
  if (file.size > MAX_BYTES) {
    return { error: "File must be under 15 MB." }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const dataUri = `data:${file.type || "application/octet-stream"};base64,${buffer.toString("base64")}`

  try {
    const url = await uploadProjectFile(dataUri, file.name)
    return { url, fileType: file.type || undefined, name: file.name }
  } catch {
    return { error: "Upload failed. Check the Cloudinary configuration." }
  }
}
