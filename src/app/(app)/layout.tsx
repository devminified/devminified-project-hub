import { getCurrentUser } from "@/lib/dal"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/animate-ui/components/radix/sidebar"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Gate every route in this group. Redirects to /login when unauthenticated.
  const user = await getCurrentUser()

  return (
    <SidebarProvider>
      <AppSidebar user={{ email: user.email, name: user.name, role: user.role }} />
      {/* min-w-0 lets the content shrink instead of overflowing; overflow-x-clip
          guards against any wide content (e.g. long ENV values) forcing the page
          to scroll sideways — `clip` (not `hidden`) keeps sticky headers working. */}
      <SidebarInset className="min-w-0 overflow-x-clip">{children}</SidebarInset>
    </SidebarProvider>
  )
}
