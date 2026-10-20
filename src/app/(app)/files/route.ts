import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/dal"
import { canViewProject } from "@/lib/projects/queries"

/**
 * Streams an uploaded doc/readme file (stored in Cloudinary) through our own
 * origin with the correct content type and file name. This is needed because
 * Cloudinary refuses to deliver some raw files directly (a default security
 * setting), so non-Word files are stored without an extension and re-typed
 * here. Access is gated to viewers of the owning project.
 *
 * GET /files?kind=doc|readme&rid=<recordId>[&download=1]
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const kind = url.searchParams.get("kind")
  const rid = url.searchParams.get("rid")
  const download = url.searchParams.get("download") === "1"

  if (!rid || (kind !== "doc" && kind !== "readme")) {
    return new Response(null, { status: 400 })
  }

  const user = await getCurrentUser()

  const record =
    kind === "doc"
      ? await prisma.doc.findUnique({
          where: { id: rid },
          select: { projectId: true, fileUrl: true, fileType: true, title: true },
        })
      : await prisma.readme.findUnique({
          where: { id: rid },
          select: { projectId: true, fileUrl: true, fileType: true, title: true },
        })

  if (!record?.fileUrl) return new Response(null, { status: 404 })
  if (!(await canViewProject(record.projectId, user))) {
    return new Response(null, { status: 403 })
  }

  const upstream = await fetch(record.fileUrl)
  if (!upstream.ok || !upstream.body) return new Response(null, { status: 502 })

  const contentType =
    record.fileType ||
    upstream.headers.get("content-type") ||
    "application/octet-stream"
  // Only PDFs are shown inline (in the preview iframe). Uploads can be any file
  // type, and serving e.g. HTML or SVG inline from our origin would let it run
  // script, so everything else is always a download.
  const inline = !download && contentType.toLowerCase().includes("pdf")
  const disposition = inline ? "inline" : "attachment"
  const safeName = record.title.replace(/["\\\r\n]/g, "")

  return new Response(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `${disposition}; filename="${safeName}"`,
      "X-Content-Type-Options": "nosniff",
      // Auth-gated per user; short private cache is enough.
      "Cache-Control": "private, max-age=3600",
    },
  })
}
