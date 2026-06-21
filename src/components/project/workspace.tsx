"use client"

import { useRouter } from "next/navigation"
import { FileText, Info, KeyRound, ScrollText } from "lucide-react"

import type { ProjectSummary, TabKey } from "@/lib/projects/types"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/radix/tabs"

const folders: { key: TabKey; label: string; icon: typeof KeyRound }[] = [
  { key: "details", label: "Details", icon: Info },
  { key: "envs", label: "ENVs", icon: KeyRound },
  { key: "docs", label: "Documentation", icon: FileText },
  { key: "readmes", label: "READMEs", icon: ScrollText },
]

/**
 * Animated tab bar (animate-ui) for the project detail page. The bar is
 * controlled by the `?tab=` URL: selecting a tab navigates, so the server still
 * fetches only that tab's data. The active panel is streamed in as `children`.
 */
export function ProjectWorkspace({
  summary,
  active,
  children,
}: {
  summary: ProjectSummary
  active: TabKey
  children: React.ReactNode
}) {
  const router = useRouter()
  const counts = summary.counts

  return (
    <div>
      <Tabs
        value={active}
        onValueChange={(value) =>
          router.push(`/projects/${summary.slug}?tab=${value}`, { scroll: false })
        }
      >
        <TabsList className="h-auto w-full flex-wrap gap-1.5 rounded-xl bg-slate-100 p-1.5">
          {folders.map((folder) => {
            const Icon = folder.icon
            const count = folder.key !== "details" ? counts[folder.key] : null
            return (
              <TabsTrigger
                key={folder.key}
                value={folder.key}
                className="gap-2 rounded-lg py-3 text-base font-semibold"
              >
                <Icon className="size-5" />
                <span>{folder.label}</span>
                {count !== null && (
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold text-slate-500 data-[state=active]:bg-cyan-100 data-[state=active]:text-cyan-700">
                    {count}
                  </span>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      <div className="mt-6">{children}</div>
    </div>
  )
}
