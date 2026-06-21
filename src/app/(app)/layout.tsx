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
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
