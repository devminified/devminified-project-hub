import { redirect } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/dal"
import { SidebarTrigger } from "@/components/animate-ui/components/radix/sidebar"
import { UsersManager } from "@/components/users-manager"

export default async function UsersPage() {
  const me = await getCurrentUser()
  // Members cannot access user management.
  if (me.role !== "ADMIN") {
    redirect("/")
  }
  const [users, allProjects] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        projects: { select: { id: true } },
      },
    }),
    prisma.project.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ])

  const rows = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role as "ADMIN" | "USER",
    status: u.status as "PENDING" | "APPROVED",
    createdAt: u.createdAt.toISOString().slice(0, 10),
    projectIds: u.projects.map((p) => p.id),
  }))

  return (
    <div className="min-h-full bg-gradient-to-b from-blue-50/60 via-white to-white">
      <header className="sticky top-0 z-10 flex min-h-19 items-center gap-3 border-b border-blue-100/80 bg-white/70 px-6 py-4 backdrop-blur">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <UsersManager
          users={rows}
          currentUserId={me.id}
          allProjects={allProjects}
        />
      </main>
    </div>
  )
}
