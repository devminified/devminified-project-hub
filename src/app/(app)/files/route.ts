import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/dal"
import { canViewProject } from "@/lib/projects/queries"

/**
 * Streams an uploaded doc/readme file (stored in Cloudinary) through our own
 * origin with the correct content type and file name. This is needed because
 * Cloudinary refuses to deliver raw PDFs directly (a default security setting),
 * so those are stored without a `.pdf` extension and re-typed here. Access is
 * gated to viewers of the owning project.
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
  const disposition = download ? "attachment" : "inline"
  const safeName = record.title.replace(/["\\\r\n]/g, "")

  return new Response(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `${disposition}; filename="${safeName}"`,
      // Auth-gated per user; short private cache is enough.
      "Cache-Control": "private, max-age=3600",
    },
  })
}
