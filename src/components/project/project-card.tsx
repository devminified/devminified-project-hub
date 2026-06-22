import Link from "next/link"
import { ArrowRight, MonitorCog } from "lucide-react"

import type { ProjectListItem } from "@/lib/projects/types"
import { StatusBadge } from "@/components/status-badge"

/** Dashboard grid card linking to a project's detail page. */
export function ProjectCard({ project }: { project: ProjectListItem }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/50"
    >
      {/* Brand accent bar reveals on hover */}
      <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-[var(--brand-primary)] transition-transform duration-300 group-hover:scale-x-100" />

      <div className="flex items-start justify-between gap-3">
        {project.imageUrl ? (
          <div className="size-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.imageUrl}
              alt={project.name}
              className="size-full object-cover"
            />
          </div>
        ) : (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[var(--brand-primary)] ring-1 ring-indigo-100 transition-colors group-hover:bg-[var(--brand-primary)] group-hover:text-white">
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

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {project.tags.length > 0 ? (
            project.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="truncate rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
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
