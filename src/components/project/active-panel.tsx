import {
  getProjectDocs,
  getProjectEnvs,
  getProjectReadmes,
  getProjectSecrets,
  getProjectTabs,
} from "@/lib/projects/queries"
import type { ProjectSummary, TabKey } from "@/lib/projects/types"
import { Skeleton } from "@/components/ui/skeleton"
import { DetailsPanel } from "./details-panel"
import { DocsPanel } from "./docs-panel"
import { EnvsPanel } from "./envs-panel"
import { ReadmesPanel } from "./readmes-panel"
import { SecretsPanel } from "./secrets-panel"

/**
 * Server component that fetches ONLY the active tab's rows and renders the
 * matching panel. Wrapped in a Suspense boundary by the page so each tab streams
 * with a skeleton fallback.
 */
export async function ActivePanel({
  active,
  summary,
  isAdmin,
  canEdit,
}: {
  active: TabKey
  summary: ProjectSummary
  /** Global admin — gates the Secrets tab. */
  isAdmin: boolean
  /** Admin OR project dev — gates editing of non-secret tab content. */
  canEdit: boolean
}) {
  if (active === "details") {
    return <DetailsPanel summary={summary} canEdit={canEdit} />
  }

  // Secrets are admin-only. Non-admins should never reach here (the tab is
  // hidden and the page coerces ?tab=secrets to details), but gate defensively.
  if (active === "secrets") {
    if (!isAdmin) {
      return <DetailsPanel summary={summary} canEdit={canEdit} />
    }
    const secrets = await getProjectSecrets(summary.slug)
    return <SecretsPanel sections={secrets} projectId={summary.id} isAdmin={isAdmin} />
  }

  if (active === "envs") {
    const [envs, tabs] = await Promise.all([
      getProjectEnvs(summary.slug),
      getProjectTabs(summary.slug, "ENV"),
    ])
    return <EnvsPanel envs={envs} tabs={tabs} projectId={summary.id} canEdit={canEdit} />
  }

  if (active === "docs") {
    const [docs, tabs] = await Promise.all([
      getProjectDocs(summary.slug),
      getProjectTabs(summary.slug, "DOC"),
    ])
    return <DocsPanel docs={docs} tabs={tabs} projectId={summary.id} canEdit={canEdit} />
  }

  const [readmes, tabs] = await Promise.all([
    getProjectReadmes(summary.slug),
    getProjectTabs(summary.slug, "README"),
  ])
  return (
    <ReadmesPanel readmes={readmes} tabs={tabs} projectId={summary.id} canEdit={canEdit} />
  )
}

/** Skeleton shown while a tab's data streams in. */
export function PanelSkeleton() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-2 h-3 w-64" />
      </div>
      <div className="space-y-3 p-5">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-3/4" />
      </div>
    </section>
  )
}
