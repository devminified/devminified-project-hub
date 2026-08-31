"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Archive, LogOut, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { LibraryFilled, UsersFilled } from "@/components/svgs"
import { logout } from "@/app/login/actions"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { ThemeToggle } from "@/components/ui/theme"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/animate-ui/components/radix/sidebar"

type IconComponent = React.ComponentType<{ className?: string }>

type NavItemDef = {
  title: string
  href: string
  icon: IconComponent
  match: (p: string) => boolean
  adminOnly: boolean
}

/**
 * Navigation is grouped rather than flat: everyone's day-to-day work sits in
 * "Workspace", and admin-only surfaces are visually separated so the elevated
 * scope is obvious.
 */
const navGroups: { label: string; items: NavItemDef[] }[] = [
  {
    label: "Workspace",
    items: [
      {
        title: "Projects",
        href: "/",
        icon: LibraryFilled,
        match: (p) => p === "/" || p.startsWith("/projects"),
        adminOnly: false,
      },
      {
        title: "Archive",
        href: "/archive",
        icon: Archive,
        match: (p) => p.startsWith("/archive"),
        adminOnly: false,
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        title: "Users",
        href: "/users",
        icon: UsersFilled,
        match: (p) => p.startsWith("/users"),
        adminOnly: true,
      },
    ],
  },
]

export function AppSidebar({
  user,
}: {
  user: { email: string; name: string | null; role: string }
}) {
  const pathname = usePathname()
  const { state, isMobile } = useSidebar()
  // The mobile drawer is always full width, so only the desktop panel ever
  // renders the icon-rail treatment.
  const collapsed = state === "collapsed" && !isMobile

  const initials = (user.name || user.email).slice(0, 2).toUpperCase()
  const isAdmin = user.role === "ADMIN"

  const groups = navGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.adminOnly || isAdmin) }))
    .filter((g) => g.items.length > 0)

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Brand. Collapses to the mark so the rail stays 48px wide. */}
      <SidebarHeader className="h-(--header-height) justify-center border-b border-sidebar-border px-3 py-0 group-data-[collapsible=icon]:px-0">
        <Link
          href="/"
          aria-label="Devminified Project Hub — home"
          className="flex items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring group-data-[collapsible=icon]:mx-auto"
        >
          {collapsed ? (
            <Image
              src="/devminified-favicon.png"
              alt=""
              width={28}
              height={28}
              priority
              className="size-7 rounded-md"
            />
          ) : (
            <Image
              src="/devminified-logo.svg"
              alt="Devminified"
              width={170}
              height={44}
              priority
              className="h-8 w-auto self-start"
            />
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-2 py-3 group-data-[collapsible=icon]:px-1.5">
        {/* Quick search. A visual affordance today; the ⌘K hint tells users
            where it will live once wired up. */}
        <div className="pb-2">
          {collapsed ? (
            <SidebarMenuButton
              tooltip="Quick search  ⌘K"
              className="h-9 justify-center rounded-lg"
            >
              <Search className="size-4" />
              <span className="sr-only">Quick search</span>
            </SidebarMenuButton>
          ) : (
            <button
              type="button"
              className={cn(
                "flex h-9 w-full items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-2.5 text-left",
                "transition-colors duration-(--animate-duration-fast)",
                "hover:border-border-strong hover:bg-sidebar-accent/70",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring"
              )}
            >
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-sm text-muted-foreground">
                Quick search…
              </span>
              <Kbd className="border-sidebar-border">⌘K</Kbd>
            </button>
          )}
        </div>

        {groups.map((group) => (
          <SidebarGroup key={group.label} className="px-0 py-1">
            <SidebarGroupLabel className="px-2 text-2xs font-semibold tracking-wider text-muted-foreground uppercase">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.title}
                    active={item.match(pathname)}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="gap-2 border-t border-sidebar-border p-2">
        {/* Signed-in identity + the two account-level controls. Collapsed, the
            row becomes a single avatar and the actions move under it. */}
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-lg p-1.5",
            collapsed && "flex-col gap-1 p-0"
          )}
        >
          <Avatar size={collapsed ? "default" : "lg"} className="shrink-0">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {user.name || "Member"}
              </p>
              <p className="truncate text-2xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          )}

          <div className={cn("flex shrink-0 items-center gap-0.5", collapsed && "flex-col")}>
            <ThemeToggle />
            <form action={logout}>
              <Button
                type="submit"
                variant="ghost"
                size="icon-sm"
                aria-label="Sign out"
                title="Sign out"
                className="text-muted-foreground hover:bg-destructive-subtle hover:text-destructive-subtle-foreground"
              >
                <LogOut />
              </Button>
            </form>
          </div>
        </div>

        {!collapsed && (
          <p className="px-1.5 text-2xs text-muted-foreground/70">
            {isAdmin ? "Administrator" : "Member"}
          </p>
        )}
      </SidebarFooter>

      {/* Drag/click strip on the panel edge — a second, mouse-friendly way to
          collapse that doesn't require finding the header button. */}
      <SidebarRail />
    </Sidebar>
  )
}

/**
 * A nav row. The active item gets three redundant cues — tinted pill, solid
 * icon tile, and a left accent bar — so it survives both colour-blindness and
 * the icon-only rail.
 */
function NavItem({
  href,
  icon: Icon,
  label,
  active = false,
}: {
  href: string
  icon: IconComponent
  label: string
  active?: boolean
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={label}
        className={cn(
          "h-10 gap-2.5 rounded-lg px-2 text-sm font-medium",
          "group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!",
          // Left accent bar, only when active and only in the expanded panel.
          "before:absolute before:inset-y-1.5 before:-left-2 before:w-0.5 before:rounded-r-full before:bg-primary before:opacity-0 before:transition-opacity",
          "group-data-[collapsible=icon]:before:hidden",
          active && "before:opacity-100"
        )}
      >
        <Link href={href} aria-current={active ? "page" : undefined}>
          <span
            aria-hidden="true"
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-md transition-colors duration-(--animate-duration-fast)",
              active
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-surface-muted text-muted-foreground"
            )}
          >
            <Icon className="size-4" />
          </span>
          <span className="truncate">{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
