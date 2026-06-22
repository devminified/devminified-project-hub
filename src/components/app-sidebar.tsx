"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { LibraryFilled, UsersFilled } from "@/components/icons";
import { logout } from "@/app/login/actions";
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
} from "@/components/animate-ui/components/radix/sidebar";

type IconComponent = React.ComponentType<{ className?: string }>

const nav: {
  title: string
  href: string
  icon: IconComponent
  match: (p: string) => boolean
  adminOnly: boolean
}[] = [
  {
    title: "Projects",
    href: "/",
    icon: LibraryFilled,
    match: (p: string) => p === "/" || p.startsWith("/projects"),
    adminOnly: false,
  },
  {
    title: "Users",
    href: "/users",
    icon: UsersFilled,
    match: (p: string) => p.startsWith("/users"),
    adminOnly: true,
  },
];

export function AppSidebar({
  user,
}: {
  user: { email: string; name: string | null; role: string };
}) {
  const pathname = usePathname();
  const initials = (user.name || user.email).slice(0, 2).toUpperCase();
  const isAdmin = user.role === "ADMIN";
  const visibleNav = nav.filter((item) => !item.adminOnly || isAdmin);

  return (
    <Sidebar>
      {/* Logo */}
      <SidebarHeader className="min-h-19 justify-center border-b border-slate-100 px-4 py-0">
        <Image
          src="/devminified-logo.svg"
          alt="Devminified"
          width={170}
          height={44}
          priority
          className="h-9 w-auto"
        />
      </SidebarHeader>

      {/* Search (visual quick-search affordance) */}
      <div className="px-3 pt-2.5">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left transition-colors hover:border-slate-300"
        >
          <Search className="size-3.5 shrink-0 text-slate-400" />
          <span className="flex-1 text-sm text-slate-400">Quick search…</span>
          <kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>

      <SidebarContent className="px-2 pt-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {visibleNav.map((item) => (
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
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-100">
        <div className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-slate-50">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[#7c3aed] text-xs font-semibold text-white shadow-sm shadow-indigo-500/25">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user.name || "Member"}
            </p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Sign out"
              className="flex size-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-[var(--brand-primary)]"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

/**
 * Sidebar nav row with a colored icon tile (solid blue when active). When
 * `href` is omitted the row is a non-navigating placeholder (Settings / Help).
 */
function NavItem({
  href,
  icon: Icon,
  label,
  active = false,
}: {
  href?: string;
  icon: IconComponent;
  label: string;
  active?: boolean;
}) {
  const inner = (
    <>
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors",
          active
            ? "bg-[var(--brand-primary)] text-white"
            : "bg-slate-100 text-slate-500"
        )}
      >
        <Icon className="size-4" />
      </span>
      <span>{label}</span>
    </>
  );

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild={Boolean(href)}
        size="lg"
        isActive={active}
        tooltip={label}
        className="h-11 rounded-xl text-[15px] font-semibold"
      >
        {href ? <Link href={href}>{inner}</Link> : <button type="button">{inner}</button>}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
