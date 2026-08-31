import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1.5",
    "overflow-hidden rounded-4xl border border-transparent font-medium whitespace-nowrap",
    "transition-colors duration-(--animate-duration-fast) ease-(--ease-standard)",
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "aria-invalid:border-destructive",
    // A leading dot (<span data-slot="badge-dot" />) inherits the text colour.
    "[&>[data-slot=badge-dot]]:size-1.5 [&>[data-slot=badge-dot]]:rounded-full [&>[data-slot=badge-dot]]:bg-current",
    "[&>svg]:pointer-events-none [&>svg]:size-3.5!",
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary-hover",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-accent",
        /** Neutral chip — the right default for tags and counts. */
        muted: "bg-surface-muted text-muted-foreground [a]:hover:bg-muted",
        outline:
          "border-border-strong text-foreground [a]:hover:bg-surface-muted",
        destructive:
          "bg-destructive-subtle text-destructive-subtle-foreground focus-visible:outline-destructive",
        success:
          "bg-success-subtle text-success-subtle-foreground",
        warning:
          "bg-warning-subtle text-warning-subtle-foreground",
        info: "bg-info-subtle text-info-subtle-foreground",
        ghost: "text-muted-foreground hover:bg-surface-muted",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-5 px-1.5 text-2xs [&>svg]:size-3!",
        default: "h-5.5 px-2 text-xs",
        lg: "h-6.5 px-2.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  size = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      { className: cn(badgeVariants({ variant, size }), className) },
      props
    ),
    render,
    state: { slot: "badge", variant, size },
  })
}

/** Leading status dot for use inside a <Badge>. Inherits the badge's colour. */
function BadgeDot({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="badge-dot" className={className} {...props} />
}

export { Badge, BadgeDot, badgeVariants }
