import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"

import { getProjectDetail } from "@/lib/projects-db"
import { getCurrentUser } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import { StatusBadge } from "@/components/status-badge"
import { ProjectWorkspace } from "@/components/project-workspace"
import { ProjectActions } from "@/components/project-form-dialog"

export default async function ProjectDetailPage({
  params,
}: PageProps<"/projects/[id]">) {
  const { id } = await params
  const [project, user] = await Promise.all([
    getProjectDetail(id),
    getCurrentUser(),
  ])

  if (!project) {
    notFound()
  }

  const isAdmin = user.role === "ADMIN"

  // Members can only open projects they've been granted access to.
  if (!isAdmin) {
    const access = await prisma.project.findFirst({
      where: { id: project.id, members: { some: { id: user.id } } },
      select: { id: true },
    })
    if (!access) notFound()
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-blue-50/60 via-white to-white">
      <header className="border-b border-blue-100/80 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
          >
            <ChevronLeft className="size-4" />
            Back to projects
          </Link>

          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  {project.name}
                </h1>
                <StatusBadge status={project.status} />
              </div>
              {project.description && (
                <p className="mt-1 max-w-2xl text-sm text-slate-500">
                  {project.description}
                </p>
              )}
              {project.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-3">
              <p className="text-xs text-slate-400">Updated {project.updatedAt}</p>
              {isAdmin && (
                <ProjectActions
                  project={{
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    status: project.status,
                    tags: project.tags,
                    productionUrl: project.productionUrl,
                    stagingUrl: project.stagingUrl,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <ProjectWorkspace project={project} isAdmin={isAdmin} />
      </main>
    </div>
  )
}
