import Link from "next/link";
import { ArrowUpRight, FileText, FolderClosed, KeyRound } from "lucide-react";

import { getProjectsFromDb } from "@/lib/projects-db";
import { getCurrentUser } from "@/lib/dal";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ProjectCreateButton } from "@/components/project-form-dialog";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const projects = await getProjectsFromDb({ id: user.id, role: user.role });
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="min-h-full bg-gradient-to-b from-blue-50/60 via-white to-white">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-blue-100/80 bg-white/70 px-6 py-4 backdrop-blur">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-base font-semibold text-slate-900">Projects</h1>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-2xl mb-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-cyan)] px-3 py-1 text-xs font-medium text-white shadow-sm">
              All Projects
            </span>

            <p className="mt-1 text-sm text-slate-500">
              {projects.length} {projects.length === 1 ? "project" : "projects"}{" "}
              · Select one to view its environments, docs, and readmes.
            </p>
          </div>
          {isAdmin && <ProjectCreateButton />}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl hover:shadow-blue-200/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            >
              {/* Brand accent bar reveals on hover */}
              <span className="absolute inset-x-0 top-0 h-1.5 origin-left scale-x-0 bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-cyan)] transition-transform duration-300 group-hover:scale-x-100" />

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-blue)] to-[var(--brand-cyan)] text-white shadow-md shadow-blue-500/25 transition-transform duration-300 group-hover:scale-105">
                    <FolderClosed className="size-6" />
                  </div>
                  <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-[var(--brand-blue)]">
                    {project.name}
                  </h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
