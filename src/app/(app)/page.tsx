import { getProjectList } from "@/lib/projects/queries";
import { getCurrentUser } from "@/lib/dal";
import { SidebarTrigger } from "@/components/animate-ui/components/radix/sidebar";
import { ProjectCreateButton } from "@/components/project-form-dialog";
import { ProjectCard } from "@/components/project/project-card";
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

      <main className="px-6 py-8 lg:px-8">
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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
