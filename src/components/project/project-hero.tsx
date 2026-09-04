import { BookOpen, FileText, KeyRound, Users } from "lucide-react"

import type { ProjectSummary } from "@/lib/projects/types"
import { StatusBadge } from "@/components/status-badge"
import { Badge, BadgeDot } from "@/components/ui/badge"
import { StatTile, StatTileGroup } from "@/components/ui/stat-tile"

/**
 * Summary block under the project page header: status/archived badges, tag
 * chips, description, and the stat tile row. Identity (name, avatar, actions)
 * lives in the page's <PageHeader>.
 */
export function ProjectHero({ summary }: { summary: ProjectSummary }) {
  const counts = summary.counts
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={summary.status} />
          {summary.archived && (
            <Badge variant="muted">
              <BadgeDot />
              Archived
            </Badge>
          )}
          {summary.tags.map((tag, i) => (
            <Badge key={`${tag}-${i}`} variant="muted">
              {tag}
            </Badge>
          ))}
        </div>
        {summary.description && (
          <p className="max-w-3xl text-sm leading-relaxed text-pretty text-muted-foreground">
            {summary.description}
          </p>
        )}
      </div>

      <StatTileGroup>
        <StatTile
          icon={<KeyRound />}
          tone="brand"
          value={counts.envs}
          label="Variables"
        />
        <StatTile
          icon={<FileText />}
          tone="info"
          value={counts.docs}
          label="Documents"
        />
        <StatTile
          icon={<BookOpen />}
          tone="warning"
          value={counts.readmes}
          label="READMEs"
        />
        <StatTile
          icon={<Users />}
          tone="success"
          value={counts.members}
          label={counts.members === 1 ? "Member" : "Members"}
        />
      </StatTileGroup>
    </section>
  )
}
