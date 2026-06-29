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
    <div className="-mb-px flex gap-1 overflow-x-auto">
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
              "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
              isActive
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
                : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            <TabIcon icon={Icon} />
            {folder.label}
            {count !== null && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] font-bold",
                  isActive
                    ? "bg-indigo-100 text-indigo-700"
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
