import * as React from "react"

import { cn } from "@/lib/utils"

const tones = {
  default: "bg-surface-muted text-muted-foreground",
  brand: "bg-primary-subtle text-primary-subtle-foreground",
  success: "bg-success-subtle text-success-subtle-foreground",
  warning: "bg-warning-subtle text-warning-subtle-foreground",
  info: "bg-info-subtle text-info-subtle-foreground",
  destructive: "bg-destructive-subtle text-destructive-subtle-foreground",
} as const

/**
 * A single metric: big number, small label, optional icon and trend.
 * Use inside <StatTileGroup> for a responsive KPI row.
 *
 * ```tsx
 * <StatTile label="Variables" value={12} icon={<KeyIcon />} tone="brand" />
 * ```
 *
 * @param tone  Colour of the icon chip only — the number always uses the
 *   foreground colour so a row of tiles stays scannable.
 * @param trend `{ value, direction }`; `direction` picks the colour and arrow.
 */
function StatTile({
  className,
  label,
  value,
  icon,
  hint,
  tone = "default",
  trend,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  label: React.ReactNode
  value: React.ReactNode
  icon?: React.ReactNode
  hint?: React.ReactNode
  tone?: keyof typeof tones
  trend?: { value: React.ReactNode; direction: "up" | "down" | "flat" }
}) {
  return (
    <div
      data-slot="stat-tile"
      data-tone={tone}
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-2xs",
        className
      )}
      {...props}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg [&>svg]:size-4.5",
            tones[tone]
          )}
        >
          {icon}
        </span>
      ) : null}

      <div className="flex min-w-0 flex-col">
        <span className="flex items-baseline gap-1.5">
          <span className="font-heading text-xl leading-none font-semibold tabular-nums text-foreground">
            {value}
          </span>
          {trend ? (
            <span
              className={cn(
                "text-xs font-medium tabular-nums",
                trend.direction === "up" && "text-success",
                trend.direction === "down" && "text-destructive",
                trend.direction === "flat" && "text-muted-foreground"
              )}
            >
              {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"}{" "}
              {trend.value}
            </span>
          ) : null}
        </span>
        <span className="truncate text-xs text-muted-foreground">{label}</span>
        {hint ? (
          <span className="truncate text-2xs text-muted-foreground/80">{hint}</span>
        ) : null}
      </div>
    </div>
  )
}

/** Responsive grid for a row of <StatTile>s: 2 up on mobile, 4 up from `sm`. */
function StatTileGroup({
  className,
  columns = 4,
  ...props
}: React.ComponentProps<"div"> & { columns?: 2 | 3 | 4 }) {
  return (
    <div
      data-slot="stat-tile-group"
      className={cn(
        "grid grid-cols-2 gap-3",
        columns === 3 && "sm:grid-cols-3",
        columns === 4 && "sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
      {...props}
    />
  )
}

export { StatTile, StatTileGroup }
