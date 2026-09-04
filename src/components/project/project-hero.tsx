import { BookOpen, FileText, KeyRound, Users } from "lucide-react"

import type { ProjectSummary, TabKey } from "@/lib/projects/types"
import { projectImageSrc, projectInitial } from "@/lib/projects/utils"
import { StatusBadge } from "@/components/status-badge"
import { ProjectActions } from "@/components/project-form-dialog"
import { ProjectWorkspace } from "@/components/project/workspace"
import { ManageDevsButton } from "@/components/project/manage-devs-dialog"

/** Rotating tint styles for tag chips so adjacent tags get distinct colors. */
const TAG_TINTS = [
  "bg-blue-50 text-blue-700 ring-blue-200",
  "bg-violet-50 text-violet-700 ring-violet-200",
  "bg-cyan-50 text-cyan-700 ring-cyan-200",
  "bg-rose-50 text-rose-700 ring-rose-200",
  "bg-amber-50 text-amber-700 ring-amber-200",
]

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
  // Optimized avatar src for display; summary.imageUrl (original) is still
  // passed to the edit form below so editing preserves the stored value.
  const heroImageSrc = projectImageSrc(
    summary.imageUrl,
    summary.slug,
    summary.updatedAt,
    160
  )
  return (
    <div className="relative overflow-hidden border-b border-indigo-100 bg-white">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)]/[0.1] via-[var(--brand-cyan)]/[0.06] to-violet-500/[0.08]" />
      <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-[var(--brand-primary)]/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 top-24 size-72 rounded-full bg-[var(--brand-cyan)]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/3 size-64 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative px-6 pt-8 lg:px-8">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-start gap-5">
            <div className="shrink-0 rounded-[1.35rem] bg-gradient-to-br from-[var(--brand-blue)] via-[var(--brand-cyan)] to-violet-500 p-[3px] shadow-xl shadow-indigo-500/30">
              <div className="flex size-20 items-center justify-center overflow-hidden rounded-[1.15rem] bg-gradient-to-br from-blue-600 via-[var(--brand-primary)] to-[#1338be] text-3xl font-extrabold tracking-tight text-white">
                {heroImageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroImageSrc}
                    alt={summary.name}
                    className="size-full object-cover"
                  />
                ) : (
                  projectInitial(summary.name)
                )}
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="bg-gradient-to-r from-slate-900 via-[var(--brand-primary)] to-[var(--brand-blue)] bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
                  {summary.name}
                </h1>
                <StatusBadge status={summary.status} />
                {summary.archived && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                    <span className="size-1.5 rounded-full bg-slate-400" />
                    Archived
                  </span>
                )}
              </div>
              {summary.description && (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 line-clamp-2">
                  {summary.description}
                </p>
              )}
              {summary.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {summary.tags.map((tag, i) => (
                    <span
                      key={`${tag}-${i}`}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${TAG_TINTS[i % TAG_TINTS.length]}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-2">
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
            </div>
          )}
        </div>

        <div className="mb-7 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          <StatCard
            icon={KeyRound}
            gradient="from-blue-500 to-indigo-600 shadow-blue-500/30"
            value={summary.counts.envs}
            label="Variables"
          />
          <StatCard
            icon={FileText}
            gradient="from-violet-500 to-purple-600 shadow-violet-500/30"
            value={summary.counts.docs}
            label="Documents"
          />
          <StatCard
            icon={BookOpen}
            gradient="from-amber-500 to-orange-600 shadow-amber-500/30"
            value={summary.counts.readmes}
            label="READMEs"
          />
          <StatCard
            icon={Users}
            gradient="from-emerald-500 to-teal-600 shadow-emerald-500/30"
            value={summary.counts.members}
            label={summary.counts.members === 1 ? "Member" : "Members"}
          />
        </div>

        <ProjectWorkspace summary={summary} active={active} isAdmin={isAdmin} />
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  gradient,
  value,
  label,
}: {
  icon: typeof KeyRound
  gradient: string
  value: number
  label: string
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl bg-gradient-to-br px-4 py-3.5 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl sm:min-w-40 ${gradient}`}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
        <Icon className="size-4.5" />
      </div>
      <div>
        <div className="text-xl font-extrabold leading-none tracking-tight text-white">
          {value}
        </div>
        <div className="mt-1 text-xs font-semibold text-white/80">{label}</div>
      </div>
    </div>
  )
}
