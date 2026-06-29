import { Suspense } from "react"
import { notFound } from "next/navigation"

import { canViewProject, getProjectSummary } from "@/lib/projects/queries"
import { normalizeTab } from "@/lib/projects/utils"
import { getCurrentUser, isProjectDev } from "@/lib/dal"
import { ProjectTopBar } from "@/components/project/project-top-bar"
import { ProjectHero } from "@/components/project/project-hero"
import { ActivePanel, PanelSkeleton } from "@/components/project/active-panel"

export default async function ProjectDetailPage({
  params,
  searchParams,
}: PageProps<"/projects/[id]">) {
  const { id } = await params
  const sp = await searchParams
  const requestedTab = normalizeTab(sp.tab)

  const [summary, user] = await Promise.all([
    getProjectSummary(id),
    getCurrentUser(),
  ])

  if (!summary) {
    notFound()
  }

  const isAdmin = user.role === "ADMIN"
  // Per-project "dev" grant lets a non-admin edit this project's tab content.
  const isDev = isAdmin ? false : await isProjectDev(summary.id, user.id)
  const canEdit = isAdmin || isDev

  // Secrets is admin-only; send non-admins who deep-link to it back to Details.
  const active = requestedTab === "secrets" && !isAdmin ? "details" : requestedTab

  // Members (and project devs) can only open projects they've been granted access to.
  if (!isDev && !(await canViewProject(summary.id, user))) {
    notFound()
  }

  return (
    <div className="min-h-full bg-slate-50">
      <ProjectTopBar summary={summary} />
      <ProjectHero summary={summary} isAdmin={isAdmin} active={active} />
      <main className="px-6 py-6 lg:px-8">
        <Suspense key={active} fallback={<PanelSkeleton />}>
          <ActivePanel
            active={active}
            summary={summary}
            isAdmin={isAdmin}
            canEdit={canEdit}
          />
        </Suspense>
      </main>
    </div>
  )
}
