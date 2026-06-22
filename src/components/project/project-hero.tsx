import { BookOpen, FileText, KeyRound } from "lucide-react"

import type { ProjectSummary, TabKey } from "@/lib/projects/types"
import { projectInitial } from "@/lib/projects/utils"
import { StatusBadge } from "@/components/status-badge"
import { ProjectActions } from "@/components/project-form-dialog"
import { ProjectWorkspace } from "@/components/project/workspace"

/** Project detail hero: avatar/image, name + status + description, actions, stat cards, tabs. */
export function ProjectHero({
  summary,
  isAdmin,
  active,
}: {
  summary: ProjectSummary
  isAdmin: boolean
  active: TabKey
}) {
  return (
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
                projectInitial(summary.name)
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
