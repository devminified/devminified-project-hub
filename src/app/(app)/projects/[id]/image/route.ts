import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/dal"
import { canViewProject } from "@/lib/projects/queries"

/**
 * Serves a project's avatar as a real, HTTP-cacheable image response instead of
 * inlining its (tens-of-KB) base64 data URL into every list/detail payload.
 *
 * Cards request `/projects/[slug]/image?v=<updatedAt>`; the long immutable
 * cache plus the version query means the browser fetches each image once and
 * reuses it across navigations. Access is gated to viewers of the project.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getCurrentUser()

  const project = await prisma.project.findUnique({
    where: { slug: id },
    select: { id: true, imageUrl: true },
  })
  if (!project?.imageUrl) return new Response(null, { status: 404 })
  if (!(await canViewProject(project.id, user))) {
    return new Response(null, { status: 403 })
  }

  // Stored images are base64 data URLs (data:<mime>;base64,<data>); decode and
  // serve as real bytes. A non-data URL (external) is simply redirected.
  if (project.imageUrl.startsWith("data:")) {
    const match = /^data:([^;,]+);base64,([\s\S]+)$/.exec(project.imageUrl)
    if (!match) return new Response(null, { status: 415 })
    const body = Buffer.from(match[2], "base64")
    return new Response(body, {
      headers: {
        "Content-Type": match[1],
        "Content-Length": String(body.length),
        // Per-user (auth-gated) and versioned via the ?v= query, so safe to
        // cache aggressively. Updating the image changes updatedAt → new URL.
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    })
  }

  return Response.redirect(project.imageUrl, 307)
}
