"use server"

import { requireAdmin } from "@/lib/dal"
import { uploadProjectImage as uploadToCloudinary } from "@/lib/cloudinary"

export type UploadResult = { url?: string; error?: string }

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

/**
 * Admin-only: upload a project image to Cloudinary and return its delivery URL.
 * The browser sends the raw file; the API secret never leaves the server.
 */
export async function uploadProjectImage(
  formData: FormData
): Promise<UploadResult> {
  await requireAdmin()

  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file selected." }
  }
  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image." }
  }
  if (file.size > MAX_BYTES) {
    return { error: "Image must be under 5 MB." }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`

  try {
    const url = await uploadToCloudinary(dataUri)
    return { url }
  } catch {
    return { error: "Upload failed. Check the Cloudinary configuration." }
  }
}
