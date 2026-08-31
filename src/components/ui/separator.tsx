"use client"

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className
      )}
      {...props}
    />
  )
}

/**
 * A rule with a caption in the middle — for "or", "Archived", and other
 * in-flow section breaks.
 */
function SeparatorLabel({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="separator-label"
      className={cn(
        "flex items-center gap-3 text-2xs font-medium tracking-wide text-muted-foreground uppercase",
        "before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Separator, SeparatorLabel }
