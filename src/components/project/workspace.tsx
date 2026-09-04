"use client"

import Link, { useLinkStatus } from "next/link"
import { BookOpen, FileText, KeyRound, LayoutList, Loader2, Lock } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ProjectSummary, TabKey } from "@/lib/projects/types"

const folders: { key: TabKey; label: string; icon: typeof KeyRound; adminOnly?: boolean }[] = [
  { key: "details", label: "Details", icon: LayoutList },
  { key: "envs", label: "ENVs", icon: KeyRound },
  { key: "docs", label: "Documentation", icon: FileText },
  { key: "readmes", label: "READMEs", icon: BookOpen },
  { key: "secrets", label: "Secrets", icon: Lock, adminOnly: true },
]

/** Tab keys that show a count badge (those backed by a relation count). */
const COUNTED_TABS = ["envs", "docs", "readmes"] as const

/**
 * Underline-style tab bar for the project detail page. Each tab is a <Link>
 * that sets `?tab=`, so navigating fetches only that tab's data on the server.
 * The clicked tab shows a spinner while its navigation is pending.
 */
export function ProjectWorkspace({
  summary,
  active,
  isAdmin,
}: {
  summary: ProjectSummary
  active: TabKey
  isAdmin: boolean
}) {
  const counts = summary.counts
  const visibleFolders = folders.filter((f) => !f.adminOnly || isAdmin)

  return (
    <div className="flex gap-2 overflow-x-auto pb-5">
      {visibleFolders.map((folder) => {
        const Icon = folder.icon
        const isActive = active === folder.key
        const isCounted = (COUNTED_TABS as readonly TabKey[]).includes(folder.key)
        const count = isCounted ? counts[folder.key as keyof typeof counts] : null
        return (
          <Link
            key={folder.key}
            href={`/projects/${summary.slug}?tab=${folder.key}`}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all",
              isActive
                ? "bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-primary)] text-white shadow-md shadow-blue-500/30"
                : "bg-white/70 text-slate-500 ring-1 ring-inset ring-slate-200 hover:text-[var(--brand-primary)] hover:ring-blue-200"
            )}
          >
            <TabIcon icon={Icon} />
            {folder.label}
            {count !== null && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] font-bold",
                  isActive
                    ? "bg-white/25 text-white"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                {count}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}

/** Shows the tab's icon, swapping to a spinner while its <Link> navigation is pending. */
function TabIcon({ icon: Icon }: { icon: typeof KeyRound }) {
  const { pending } = useLinkStatus()
  return pending ? (
    <Loader2 className="size-4 animate-spin" />
  ) : (
    <Icon className="size-4" />
  )
}
