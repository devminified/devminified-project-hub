import Link from "next/link"
import { ArrowRight, MonitorCog } from "lucide-react"

import type { ProjectListItem } from "@/lib/projects/types"
import { StatusBadge } from "@/components/status-badge"

/** Rotating tint styles for tag chips so adjacent tags get distinct colors. */
const TAG_TINTS = [
  "bg-blue-50 text-blue-700",
  "bg-violet-50 text-violet-700",
  "bg-cyan-50 text-cyan-700",
]

/** Dashboard grid card linking to a project's detail page. */
export function ProjectCard({ project }: { project: ProjectListItem }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-indigo-100 bg-white p-5 shadow-md shadow-indigo-500/[0.06] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/50"
    >
      {/* Brand accent bar reveals on hover */}
      <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-[var(--brand-blue)] via-[var(--brand-cyan)] to-violet-500 transition-transform duration-300 group-hover:scale-x-100" />

      <div className="flex items-start justify-between gap-3">
        {project.imageUrl ? (
          <div className="size-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-indigo-100">
            {/* Optimized Cloudinary URL (or cacheable route) — never base64. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.imageUrl}
              alt={project.name}
              loading="lazy"
              className="size-full object-cover"
            />
          </div>
        ) : (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-[var(--brand-primary)] ring-1 ring-indigo-100 transition-all group-hover:from-[var(--brand-blue)] group-hover:to-[var(--brand-primary)] group-hover:text-white group-hover:shadow-md group-hover:shadow-blue-500/30">
            <MonitorCog className="size-6" />
          </div>
        )}
        <StatusBadge status={project.status} />
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-[var(--brand-primary)]">
          {project.name}
        </h2>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
          {project.description || "No description yet."}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-indigo-50 pt-3">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {project.tags.length > 0 ? (
            project.tags.slice(0, 2).map((tag, i) => (
              <span
                key={`${tag}-${i}`}
                className={`truncate rounded-full px-2 py-0.5 text-xs font-semibold ${TAG_TINTS[i % TAG_TINTS.length]}`}
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400">Updated {project.updatedAt}</span>
          )}
          {project.tags.length > 2 && (
            <span className="text-xs text-slate-400">+{project.tags.length - 2}</span>
          )}
        </div>
        <ArrowRight className="size-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-[var(--brand-primary)]" />
      </div>
    </Link>
  )
}
