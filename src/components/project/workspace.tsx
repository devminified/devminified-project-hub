"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, FileText, KeyRound, LayoutList, Lock } from "lucide-react"

import type { ProjectSummary, TabKey } from "@/lib/projects/types"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
 * Tab bar for the project detail page, on the shared <Tabs> line variant.
 * The value is controlled by the `?tab=` search param: selecting a tab
 * navigates, so the server fetches only that tab's data, and the trigger
 * shows a spinner while its navigation is pending. Content renders outside
 * the Tabs tree (server-side), so there are no <TabsContent> children here.
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
  const router = useRouter()
  const [pending, startNavigate] = useTransition()
  const [target, setTarget] = useState<TabKey | null>(null)

  const counts = summary.counts
  const visibleFolders = folders.filter((f) => !f.adminOnly || isAdmin)

  function handleValueChange(next: string) {
    setTarget(next as TabKey)
    startNavigate(() => {
      router.push(`/projects/${summary.slug}?tab=${next}`, { scroll: false })
    })
  }

  return (
    <Tabs value={active} onValueChange={handleValueChange} variant="line">
      <TabsList>
        {visibleFolders.map((folder) => {
          const Icon = folder.icon
          const isCounted = (COUNTED_TABS as readonly TabKey[]).includes(folder.key)
          const count = isCounted ? counts[folder.key as keyof typeof counts] : null
          const isLoading = pending && target === folder.key
          return (
            <TabsTrigger key={folder.key} value={folder.key}>
              {isLoading ? <Spinner /> : <Icon />}
              {folder.label}
              {count !== null && (
                <Badge
                  variant={active === folder.key ? "info" : "muted"}
                  size="sm"
                >
                  {count}
                </Badge>
              )}
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}
