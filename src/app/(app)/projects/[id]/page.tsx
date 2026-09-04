import { Suspense } from "react"
import { notFound } from "next/navigation"

import { canViewProject, getProjectSummary } from "@/lib/projects/queries"
import { normalizeTab, projectImageSrc, projectInitial } from "@/lib/projects/utils"
import { getCurrentUser, isProjectDev } from "@/lib/dal"
import { PageContainer, PageHeader } from "@/components/ui/page-header"
import { ProjectActions } from "@/components/project-form-dialog"
import { ManageDevsButton } from "@/components/project/manage-devs-dialog"
import { ProjectHero } from "@/components/project/project-hero"
import { ProjectWorkspace } from "@/components/project/workspace"
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

  // Optimized avatar src for display; summary.imageUrl (original) is still
  // passed to the edit form below so editing preserves the stored value.
  const avatarSrc = projectImageSrc(
    summary.imageUrl,
    summary.slug,
    summary.updatedAt,
    72
  )

  return (
    <div className="min-h-full">
      <PageHeader
        title={summary.name}
        description={`Updated ${summary.updatedAt}`}
        breadcrumb={[{ label: "Projects", href: "/" }, { label: summary.name }]}
        icon={
          avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarSrc}
              alt=""
              className="size-9 rounded-lg object-cover"
            />
          ) : (
            <span className="text-sm font-semibold">
              {projectInitial(summary.name)}
            </span>
          )
        }
        actions={
          isAdmin && (
            <>
              <ManageDevsButton projectId={summary.id} />
              <ProjectActions
                project={{
                  id: summary.id,
                  name: summary.name,
                  description: summary.description,
                  status: summary.status,
                  archived: summary.archived,
                  tags: summary.tags,
                  imageUrl: summary.imageUrl,
                }}
              />
            </>
          )
        }
      />

      <PageContainer className="flex flex-col gap-6">
        <ProjectHero summary={summary} />
        <div className="flex flex-col gap-4">
          <ProjectWorkspace summary={summary} active={active} isAdmin={isAdmin} />
          <Suspense key={active} fallback={<PanelSkeleton />}>
            <ActivePanel
              active={active}
              summary={summary}
              isAdmin={isAdmin}
              canEdit={canEdit}
            />
          </Suspense>
        </div>
      </PageContainer>
    </div>
  )
}
