import {
  getProjectDocs,
  getProjectEnvs,
  getProjectReadmes,
} from "@/lib/projects/queries"
import type { ProjectSummary, TabKey } from "@/lib/projects/types"
import { Skeleton } from "@/components/ui/skeleton"
import { DetailsPanel } from "./details-panel"
import { DocsPanel } from "./docs-panel"
import { EnvsPanel } from "./envs-panel"
import { ReadmesPanel } from "./readmes-panel"

/**
 * Server component that fetches ONLY the active tab's rows and renders the
 * matching panel. Wrapped in a Suspense boundary by the page so each tab streams
 * with a skeleton fallback.
 */
export async function ActivePanel({
  active,
  summary,
  isAdmin,
}: {
  active: TabKey
  summary: ProjectSummary
  isAdmin: boolean
}) {
  if (active === "details") {
    return <DetailsPanel summary={summary} isAdmin={isAdmin} />
  }

  if (active === "envs") {
    const envs = await getProjectEnvs(summary.slug)
    return <EnvsPanel envs={envs} projectId={summary.id} isAdmin={isAdmin} />
  }

  if (active === "docs") {
    const docs = await getProjectDocs(summary.slug)
    return <DocsPanel docs={docs} projectId={summary.id} isAdmin={isAdmin} />
  }

  const readmes = await getProjectReadmes(summary.slug)
  return <ReadmesPanel readmes={readmes} projectId={summary.id} isAdmin={isAdmin} />
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
