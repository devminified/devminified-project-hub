import { getProjectList } from "@/lib/projects/queries";
import { getCurrentUser } from "@/lib/dal";
import { SidebarTrigger } from "@/components/animate-ui/components/radix/sidebar";
import { ProjectsExplorer } from "@/components/project/projects-explorer";

export default async function ArchivePage() {
  const user = await getCurrentUser();
  // Only archived projects here. Same visibility rules as the main listing.
  const projects = await getProjectList(
    { id: user.id, role: user.role },
    { archived: true }
  );

  return (
    <div className="min-h-full bg-gradient-to-b from-blue-50/60 via-white to-white">
      <header className="sticky top-0 z-10 flex min-h-19 items-center gap-3 border-b border-blue-100/80 bg-white/70 px-6 py-4 backdrop-blur">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-2xl font-semibold text-slate-900">Archive</h1>
      </header>

      <main className="px-6 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Archived Projects
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {projects.length} {projects.length === 1 ? "project" : "projects"}{" "}
            · Open a project and choose Restore to move it back to the active
            listing.
          </p>
        </div>

        <ProjectsExplorer
          projects={projects}
          emptyTitle="No archived projects"
          emptyDescription="Projects you archive will show up here. You can restore them any time."
          searchPlaceholder="Search archived projects…"
        />
      </main>
    </div>
  );
}
