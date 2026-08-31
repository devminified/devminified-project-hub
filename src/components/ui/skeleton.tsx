import { cn } from "@/lib/utils"

/**
 * Loading placeholder. Uses a shimmer sweep rather than a pulse so a page of
 * skeletons reads as one loading surface instead of many blinking blocks.
 *
 * @param shape `block` (default), `text` (a 1em bar with rounded ends) or
 *   `circle`.
 */
function Skeleton({
  className,
  shape = "block",
  ...props
}: React.ComponentProps<"div"> & { shape?: "block" | "text" | "circle" }) {
  return (
    <div
      data-slot="skeleton"
      data-shape={shape}
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden bg-surface-muted shimmer",
        shape === "block" && "rounded-md",
        shape === "text" && "h-[1em] rounded-full",
        shape === "circle" && "aspect-square rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
