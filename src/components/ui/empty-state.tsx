import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * The "nothing here yet" panel. One component for empty lists, cleared
 * filters, and 404-ish in-page states.
 *
 * ```tsx
 * <EmptyState
 *   icon={<FolderOpenIcon />}
 *   title="No projects found"
 *   description="Create your first project to start tracking environments."
 *   action={<Button>New project</Button>}
 * />
 * ```
 *
 * @param size    `sm` for inside a card or panel, `default` for a full page.
 * @param variant `default` renders a dashed placeholder frame; `plain` drops
 *   the frame for when the parent already provides one.
 */
function EmptyState({
  className,
  icon,
  title,
  description,
  action,
  size = "default",
  variant = "default",
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  size?: "sm" | "default"
  variant?: "default" | "plain"
}) {
  return (
    <div
      data-slot="empty-state"
      data-size={size}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl px-6 text-center",
        size === "sm" ? "py-8" : "py-16",
        variant === "default" && "border border-dashed border-border bg-surface-subtle",
        className
      )}
      {...props}
    >
      {icon ? (
        <div
          aria-hidden="true"
          className={cn(
            "flex items-center justify-center rounded-2xl bg-primary-subtle text-primary-subtle-foreground",
            size === "sm"
              ? "size-10 [&>svg]:size-5"
              : "size-14 [&>svg]:size-7"
          )}
        >
          {icon}
        </div>
      ) : null}

      <div className="flex max-w-prose flex-col gap-1.5">
        <p
          className={cn(
            "font-heading font-semibold text-balance text-foreground",
            size === "sm" ? "text-sm" : "text-lg"
          )}
        >
          {title}
        </p>
        {description ? (
          <p className="text-sm text-pretty text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="mt-1 flex flex-wrap items-center justify-center gap-2">{action}</div> : null}
      {children}
    </div>
  )
}

export { EmptyState }
