import { Suspense } from "react"
import { notFound } from "next/navigation"

import { canViewProject, getProjectSummary } from "@/lib/projects/queries"
import { normalizeTab } from "@/lib/projects/utils"
import { getCurrentUser } from "@/lib/dal"
import { ProjectTopBar } from "@/components/project/project-top-bar"
import { ProjectHero } from "@/components/project/project-hero"
import { ActivePanel, PanelSkeleton } from "@/components/project/active-panel"

export default async function ProjectDetailPage({
  params,
  searchParams,
}: PageProps<"/projects/[id]">) {
  const { id } = await params
  const sp = await searchParams
  const active = normalizeTab(sp.tab)

  const [summary, user] = await Promise.all([
    getProjectSummary(id),
    getCurrentUser(),
  ])

  if (!summary) {
    notFound()
  }

  const isAdmin = user.role === "ADMIN"

  // Members can only open projects they've been granted access to.
  if (!(await canViewProject(summary.id, user))) {
    notFound()
  }

  return (
    <div className="min-h-full bg-slate-50">
      <ProjectTopBar summary={summary} />
      <ProjectHero summary={summary} isAdmin={isAdmin} active={active} />
      <main className="px-6 py-6 lg:px-8">
        <Suspense key={active} fallback={<PanelSkeleton />}>
          <ActivePanel active={active} summary={summary} isAdmin={isAdmin} />
        </Suspense>
      </main>
    </div>
  )
}
