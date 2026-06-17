import { cn } from "@/lib/utils"
import type { ProjectStatus } from "@/lib/projects"

const styles: Record<ProjectStatus, string> = {
  Production: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Staging: "bg-amber-50 text-amber-700 ring-amber-200",
  Development: "bg-blue-50 text-blue-700 ring-blue-200",
}

const dot: Record<ProjectStatus, string> = {
  Production: "bg-emerald-500",
  Staging: "bg-amber-500",
  Development: "bg-blue-500",
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        styles[status]
      )}
    >
      <span className={cn("size-1.5 rounded-full", dot[status])} />
      {status}
    </span>
  )
}
