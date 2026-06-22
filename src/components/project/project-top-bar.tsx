import Link from "next/link"
import { ChevronLeft, Clock, FolderKanban } from "lucide-react"

import type { ProjectSummary } from "@/lib/projects/types"
import { SidebarTrigger } from "@/components/animate-ui/components/radix/sidebar"

/** Sticky top bar for the project detail page: back link, breadcrumb, updated date. */
export function ProjectTopBar({ summary }: { summary: ProjectSummary }) {
  return (
    <div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-6">
      <SidebarTrigger className="-ml-1" />
      <Link
        href="/"
        className="inline-flex items-center gap-1 rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-slate-200 hover:text-slate-700"
      >
        <ChevronLeft className="size-3.5" />
        Back
      </Link>
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <FolderKanban className="size-3.5" />
        <Link href="/" className="transition-colors hover:text-slate-600">
          Projects
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-slate-700">{summary.name}</span>
      </div>
      <div className="flex-1" />
      <span className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
        <Clock className="size-3.5" />
        Updated {summary.updatedAt}
      </span>
    </div>
  )
}
