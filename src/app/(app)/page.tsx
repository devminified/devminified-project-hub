import Link from "next/link";
import { ArrowRight, MonitorCog } from "lucide-react";

import { getProjectList } from "@/lib/projects/queries";
import { getCurrentUser } from "@/lib/dal";
import { SidebarTrigger } from "@/components/animate-ui/components/radix/sidebar";
import { ProjectCreateButton } from "@/components/project-form-dialog";
import { StatusBadge } from "@/components/status-badge";
import { EmptyResult } from "@/components/empty-result";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const projects = await getProjectList({ id: user.id, role: user.role });
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="min-h-full bg-gradient-to-b from-blue-50/60 via-white to-white">
      <header className="sticky top-0 z-10 flex min-h-19 items-center gap-3 border-b border-blue-100/80 bg-white/70 px-6 py-4 backdrop-blur">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              All Projects
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {projects.length} {projects.length === 1 ? "project" : "projects"}{" "}
              · Select one to view its environments, docs, and readmes.
            </p>
          </div>
          {isAdmin && <ProjectCreateButton />}
        </div>

        {projects.length === 0 ? (
          <EmptyResult
            title="No projects found"
            description={
              isAdmin
                ? "Create your first project to start tracking its environments, docs, and readmes."
                : "You don't have access to any projects yet. Ask an admin to grant you access."
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-cyan)]/50"
              >
                {/* Brand accent bar reveals on hover */}
                <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-[var(--brand-cyan)] transition-transform duration-300 group-hover:scale-x-100" />

                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[var(--brand-cyan)] ring-1 ring-cyan-100 transition-colors group-hover:bg-[var(--brand-cyan)] group-hover:text-white">
                    <MonitorCog className="size-6" />
                  </div>
                  <StatusBadge status={project.status} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-[var(--brand-cyan)]">
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
                      <span className="text-xs text-slate-400">
                        +{project.tags.length - 2}
                      </span>
                    )}
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-[var(--brand-cyan)]" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
