import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"

import { canViewProject, getProjectSummary } from "@/lib/projects/queries"
import { normalizeTab } from "@/lib/projects/utils"
import { getCurrentUser } from "@/lib/dal"
import { ProjectWorkspace } from "@/components/project/workspace"
import { ActivePanel, PanelSkeleton } from "@/components/project/active-panel"
import { ProjectActions } from "@/components/project-form-dialog"

export default async function ProjectDetailPage({
  params,
  searchParams,
}: PageProps<"/projects/[id]">) {
  const { id } = await params
  const sp = await searchParams
  const active = normalizeTab(sp.tab)

  const [summary, user] = await Promise.all([getProjectSummary(id), getCurrentUser()])

  if (!summary) {
    notFound()
  }

  const isAdmin = user.role === "ADMIN"

  // Members can only open projects they've been granted access to.
  if (!(await canViewProject(summary.id, user))) {
    notFound()
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
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {summary.name}
              </h1>
              {summary.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {summary.tags.map((tag) => (
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
              <p className="text-xs text-slate-400">Updated {summary.updatedAt}</p>
              {isAdmin && (
                <ProjectActions
                  project={{
                    id: summary.id,
                    name: summary.name,
                    description: summary.description,
                    status: summary.status,
                    tags: summary.tags,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <ProjectWorkspace summary={summary} active={active}>
          <Suspense key={active} fallback={<PanelSkeleton />}>
            <ActivePanel active={active} summary={summary} isAdmin={isAdmin} />
          </Suspense>
        </ProjectWorkspace>
      </main>
    </div>
  )
}
