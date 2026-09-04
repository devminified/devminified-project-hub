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
    <div className="min-h-full bg-gradient-to-b from-indigo-50/70 via-slate-50 to-cyan-50/40">
      <header className="sticky top-0 z-10 flex min-h-19 items-center gap-3 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-[var(--brand-blue)] via-[var(--brand-cyan)] to-violet-500" />
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-2xl font-semibold text-slate-900">Archive</h1>
      </header>

      <main className="px-6 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="bg-gradient-to-r from-slate-900 via-[var(--brand-primary)] to-[var(--brand-blue)] bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
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
