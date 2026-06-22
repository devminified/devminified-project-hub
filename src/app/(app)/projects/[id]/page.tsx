import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BookOpen, ChevronLeft, Clock, FileText, FolderKanban, KeyRound } from "lucide-react"

import { canViewProject, getProjectSummary } from "@/lib/projects/queries"
import { normalizeTab } from "@/lib/projects/utils"
import { getCurrentUser } from "@/lib/dal"
import { SidebarTrigger } from "@/components/animate-ui/components/radix/sidebar"
import { StatusBadge } from "@/components/status-badge"
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

  const initial = (summary.name.trim()[0] ?? "·").toUpperCase()

  return (
    <div className="min-h-full bg-slate-50">
      {/* Top bar */}
      <div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-6">
        <SidebarTrigger className="-ml-1" />
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-slate-200 hover:text-slate-700"
        >
          <ChevronLeft className="size-3.5" />
          Back
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <FolderKanban className="size-3.5" />
          <Link href="/" className="transition-colors hover:text-slate-600">
            Projects
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-700">{summary.name}</span>
        </div>
        <div className="flex-1" />
        <span className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
          <Clock className="size-3.5" />
          Updated {summary.updatedAt}
        </span>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)]/[0.06] via-blue-500/[0.03] to-transparent" />
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[var(--brand-primary)]/10 blur-3xl" />

        <div className="relative px-6 pt-7 lg:px-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="flex size-15 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-[var(--brand-primary)] to-[#1338be] text-2xl font-extrabold tracking-tight text-white shadow-lg shadow-indigo-500/30">
                {summary.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={summary.imageUrl}
                    alt={summary.name}
                    className="size-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    {summary.name}
                  </h1>
                  <StatusBadge status={summary.status} />
                </div>
                {summary.description && (
                  <p className="mt-1 max-w-2xl text-sm text-slate-500">
                    {summary.description}
                  </p>
                )}
              </div>
            </div>
            {isAdmin && (
              <ProjectActions
                project={{
                  id: summary.id,
                  name: summary.name,
                  description: summary.description,
                  status: summary.status,
                  tags: summary.tags,
                  imageUrl: summary.imageUrl,
                }}
              />
            )}
          </div>

          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <StatCard
              icon={KeyRound}
              tint="bg-blue-100 text-blue-700"
              value={summary.counts.envs}
              label="Variables"
            />
            <StatCard
              icon={FileText}
              tint="bg-violet-100 text-violet-700"
              value={summary.counts.docs}
              label="Documents"
            />
            <StatCard
              icon={BookOpen}
              tint="bg-amber-100 text-amber-700"
              value={summary.counts.readmes}
              label="READMEs"
            />
          </div>

          <ProjectWorkspace summary={summary} active={active} />
        </div>
      </div>

      {/* Tab content */}
      <main className="px-6 py-6 lg:px-8">
        <Suspense key={active} fallback={<PanelSkeleton />}>
          <ActivePanel active={active} summary={summary} isAdmin={isAdmin} />
        </Suspense>
      </main>
    </div>
  )
}

function StatCard({
  icon: Icon,
  tint,
  value,
  label,
}: {
  icon: typeof KeyRound
  tint: string
  value: number
  label: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:min-w-40">
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tint}`}>
        <Icon className="size-4" />
      </div>
      <div>
        <div className="text-lg font-extrabold leading-none tracking-tight text-slate-900">
          {value}
        </div>
        <div className="mt-1 text-xs font-medium text-slate-500">{label}</div>
      </div>
    </div>
  )
}
