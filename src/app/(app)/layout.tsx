import { getCurrentUser } from "@/lib/dal"
import { AppSidebar } from "@/components/app-sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
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
    <TooltipProvider>
      <SidebarProvider>
        {/* Keyboard users land here first: one Tab, one Enter, straight past
            the whole nav. Visible only while focused. */}
        <a href="#main-content" className="skip-link">
          <span className="inline-flex items-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-lg">
            Skip to content
          </span>
        </a>

        <AppSidebar
          user={{ email: user.email, name: user.name, role: user.role }}
        />

        {/* min-w-0 lets the content shrink instead of overflowing; overflow-x-clip
            guards against wide content (e.g. long ENV values) forcing a sideways
            scroll — `clip` (not `hidden`) keeps sticky headers working. */}
        <SidebarInset
          id="main-content"
          className="min-w-0 overflow-x-clip bg-surface-subtle"
        >
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
