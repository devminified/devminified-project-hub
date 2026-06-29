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

export { cloudinary }
