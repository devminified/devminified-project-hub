import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/dal"
import { getProjectOptions, getUsersForAdmin } from "@/lib/users/queries"
import { SidebarTrigger } from "@/components/animate-ui/components/radix/sidebar"
import { UsersManager } from "@/components/users-manager"

export default async function UsersPage() {
  const me = await getCurrentUser()
  // Members cannot access user management.
  if (me.role !== "ADMIN") {
    redirect("/")
  }

  const [users, allProjects] = await Promise.all([
    getUsersForAdmin(),
    getProjectOptions(),
  ])

  return (
    <div className="min-h-full bg-gradient-to-b from-indigo-50/70 via-slate-50 to-cyan-50/40">
      <header className="sticky top-0 z-10 flex min-h-19 items-center gap-3 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-[var(--brand-blue)] via-[var(--brand-cyan)] to-violet-500" />
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
      </header>

      <main className="px-6 py-8 lg:px-8">
        <UsersManager users={users} currentUserId={me.id} allProjects={allProjects} />
      </main>
    </div>
  )
}
