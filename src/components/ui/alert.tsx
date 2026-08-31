import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  InfoIcon,
  XCircleIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  [
    "relative grid w-full items-start gap-x-3 gap-y-1 rounded-lg border px-3.5 py-3 text-sm",
    "has-[>svg]:grid-cols-[--spacing(4)_1fr] grid-cols-[0_1fr]",
    "[&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  ],
  {
    variants: {
      variant: {
        default: "border-border bg-surface-subtle text-foreground",
        info: "border-info/25 bg-info-subtle text-info-subtle-foreground",
        success:
          "border-success/25 bg-success-subtle text-success-subtle-foreground",
        warning:
          "border-warning/35 bg-warning-subtle text-warning-subtle-foreground",
        destructive:
          "border-destructive/25 bg-destructive-subtle text-destructive-subtle-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

const defaultIcons = {
  default: null,
  info: InfoIcon,
  success: CheckCircle2Icon,
  warning: AlertTriangleIcon,
  destructive: XCircleIcon,
} as const

/**
 * Inline, non-blocking message attached to a region of the page.
 *
 * ```tsx
 * <Alert variant="warning">
 *   <AlertTitle>Unsaved changes</AlertTitle>
 *   <AlertDescription>Leaving now discards this draft.</AlertDescription>
 * </Alert>
 * ```
 *
 * @param icon Pass an element to override, or `null` to drop the icon.
 *   Omit it to get the variant's default icon.
 */
function Alert({
  className,
  variant = "default",
  icon,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & { icon?: React.ReactNode }) {
  const Fallback = defaultIcons[variant ?? "default"]
  const resolvedIcon =
    icon !== undefined ? icon : Fallback ? <Fallback aria-hidden="true" /> : null

  return (
    <div
      data-slot="alert"
      role={variant === "destructive" ? "alert" : "status"}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {resolvedIcon}
      {children}
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 font-medium tracking-tight text-balance",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 text-sm text-pretty opacity-90 [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

/** Trailing action slot — right-aligned on the first row. */
function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("col-start-2 mt-1 flex items-center gap-2", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction, alertVariants }
