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

/** Folder all uploaded project files (docs / readmes) live under in Cloudinary. */
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
 * Signed, server-side upload of a file of any type (passed as a base64 data URI)
 * to Cloudinary as a `raw` resource, under a unique public id derived from the
 * original file name. Returns the canonical secure URL.
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
 * Extensions kept on the public id. Word docs are previewed by the Office online
 * viewer straight from the public Cloudinary URL, which needs the extension.
 * Everything else is stored without one, because Cloudinary blocks *delivery*
 * of raw files with some extensions (PDF, ZIP, ... — an account security
 * setting), and is served through our own `/files` route instead.
 */
const KEPT_EXTENSIONS = new Set([".doc", ".docx"])

/**
 * Build a Cloudinary-safe public id from a file name: sanitize and add a unique
 * suffix so two "README.pdf" uploads don't collide. Only Word extensions are
 * kept (see `KEPT_EXTENSIONS`).
 */
function uniquePublicId(fileName: string) {
  const name = fileName.trim()
  const dot = name.lastIndexOf(".")
  const rawExt = dot > 0 ? name.slice(dot) : ""
  const ext = KEPT_EXTENSIONS.has(rawExt.toLowerCase()) ? rawExt : ""
  const base = (dot > 0 ? name.slice(0, dot) : name).replace(
    /[^a-zA-Z0-9._-]+/g,
    "-"
  )
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
  return `${base || "file"}-${suffix}${ext}`
}

export { cloudinary }
