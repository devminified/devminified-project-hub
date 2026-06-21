"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleUser, FolderKanban, LogOut } from "lucide-react";

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

const nav = [
  {
    title: "Projects",
    href: "/",
    icon: FolderKanban,
    match: (p: string) => p === "/" || p.startsWith("/projects"),
    adminOnly: false,
  },
  {
    title: "Users",
    href: "/users",
    icon: CircleUser,
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
      <SidebarHeader className="min-h-19 justify-center border-b border-slate-200 bg-white px-5 py-0">
        <Image
          src="/devminified-logo.svg"
          alt="Devminified"
          width={160}
          height={42}
          priority
          className="h-9 w-auto"
        />
      </SidebarHeader>

      <SidebarContent className="px-2 pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-sm font-bold uppercase tracking-wider text-slate-500">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {visibleNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    isActive={item.match(pathname)}
                    tooltip={item.title}
                    className="h-13 rounded-xl text-base font-semibold"
                  >
                    <Link href={item.href}>
                      <item.icon className="size-6" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-blue)] to-[var(--brand-cyan)] text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">
              {user.name || "Member"}
            </p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Sign out"
              className="flex size-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-[var(--brand-blue)]"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
