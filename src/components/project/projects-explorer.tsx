"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import type { ProjectListItem } from "@/lib/projects/types"
import { Input } from "@/components/ui/input"
import { ProjectCard } from "@/components/project/project-card"
import { EmptyResult } from "@/components/empty-result"

/**
 * Client-side searchable grid of project cards. Filters the pre-fetched list
 * in-memory by name, description, and tags — mirroring the search idiom used in
 * the user-access dialog. Used by both the main listing and the /archive page.
 */
export function ProjectsExplorer({
  projects,
  emptyTitle,
  emptyDescription,
  emptyAction,
  searchPlaceholder = "Search projects…",
}: {
  projects: ProjectListItem[]
  emptyTitle: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
  searchPlaceholder?: string
}) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return projects
    return projects.filter((p) => {
      const haystack = [p.name, p.description, ...p.tags]
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [query, projects])

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-11 pl-9"
        />
      </div>

      {projects.length === 0 ? (
        <EmptyResult
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      ) : filtered.length === 0 ? (
        <EmptyResult
          title="No matching projects"
          description={`Nothing matches “${query.trim()}”. Try a different search.`}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
