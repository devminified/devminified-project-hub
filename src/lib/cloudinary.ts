import "server-only"
import { v2 as cloudinary } from "cloudinary"

// Configured from env at module load. Uploads fail clearly at runtime if these
// are unset, rather than silently using the wrong account.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

/** Folder all project images live under in Cloudinary. */
export const PROJECT_IMAGE_FOLDER = "project-hub/projects"

/** Folder all project document files (PDF / Word) live under in Cloudinary. */
export const PROJECT_FILE_FOLDER = "project-hub/files"

/**
 * Signed, server-side upload of an image (passed as a base64 data URI) to
 * Cloudinary. Returns the canonical secure URL to store in `Project.imageUrl`.
 */
export async function uploadProjectImage(
  dataUri: string,
  publicId?: string
): Promise<string> {
  const res = await cloudinary.uploader.upload(dataUri, {
    folder: PROJECT_IMAGE_FOLDER,
    resource_type: "image",
    overwrite: true,
    ...(publicId ? { public_id: publicId } : {}),
  })
  return res.secure_url
}

/**
 * Signed, server-side upload of a document file (PDF / Word, passed as a base64
 * data URI) to Cloudinary as a `raw` resource. The original file name is kept
 * (with a unique suffix) so the delivery URL ends in the right extension and is
 * served with the correct content type. Returns the canonical secure URL.
 */
export async function uploadProjectFile(
  dataUri: string,
  fileName: string
): Promise<string> {
  const res = await cloudinary.uploader.upload(dataUri, {
    folder: PROJECT_FILE_FOLDER,
    resource_type: "raw",
    public_id: uniquePublicId(fileName),
  })
  return res.secure_url
}

/**
 * Cloudinary blocks *delivery* of raw files whose public id ends in these
 * extensions (a default account security setting). For these we drop the
 * extension on upload and serve the bytes through our own route with the right
 * content type instead. Word docs deliver fine, so they keep their extension.
 */
const BLOCKED_DELIVERY_EXTENSIONS = new Set([".pdf", ".zip"])

/**
 * Build a Cloudinary-safe public id from a file name: sanitize and add a unique
 * suffix so two "README.pdf" uploads don't collide. The extension is preserved
 * so raw delivery gets the right content type — except for extensions Cloudinary
 * refuses to deliver (PDF/ZIP), which are stripped and served via our route.
 */
function uniquePublicId(fileName: string) {
  const name = fileName.trim()
  const dot = name.lastIndexOf(".")
  const rawExt = dot > 0 ? name.slice(dot) : ""
  const ext = BLOCKED_DELIVERY_EXTENSIONS.has(rawExt.toLowerCase()) ? "" : rawExt
  const base = (dot > 0 ? name.slice(0, dot) : name).replace(
    /[^a-zA-Z0-9._-]+/g,
    "-"
  )
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
  return `${base || "file"}-${suffix}${ext}`
}

export { cloudinary }
