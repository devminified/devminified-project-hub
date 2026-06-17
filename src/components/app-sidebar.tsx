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
} from "@/components/ui/sidebar";

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
      <SidebarHeader className="bg-white px-5 py-5 shadow-sm">
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
          <SidebarGroupLabel className="text-white font-bold 2xl:text-lg">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {visibleNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    size="lg"
                    isActive={item.match(pathname)}
                    tooltip={item.title}
                    className="rounded-xl font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15 hover:text-white hover:shadow-md [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:scale-110 data-active:bg-white/15 data-active:font-semibold data-active:text-white data-active:hover:bg-white/15"
                    render={
                      <Link href={item.href}>
                        <item.icon className="size-5" />
                        <span>{item.title}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/25">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-[var(--brand-blue)]">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {user.name || "Member"}
            </p>
            <p className="truncate text-xs text-white/70">{user.email}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Sign out"
              className="flex size-8 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white hover:text-[var(--brand-blue)]"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
