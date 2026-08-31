import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Surface container. `--card-spacing` drives every child's padding, so a card
 * only ever has one density knob.
 *
 * @param size    `sm` tightens the internal rhythm (12px vs 16px).
 * @param variant `default` = hairline border. `elevated` = border + shadow.
 *                `interactive` = elevated, plus hover/press affordances for
 *                cards that are themselves links or buttons.
 */
function Card({
  className,
  size = "default",
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  size?: "default" | "sm"
  variant?: "default" | "elevated" | "interactive"
}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(
        "group/card relative flex flex-col gap-(--card-spacing) rounded-xl border border-border bg-card py-(--card-spacing) text-sm text-card-foreground",
        "[--card-spacing:--spacing(4)] data-[size=sm]:[--card-spacing:--spacing(3)]",
        "has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0",
        "*:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        variant === "elevated" && "shadow-sm",
        variant === "interactive" && [
          "shadow-xs transition-[box-shadow,border-color,translate] duration-(--animate-duration-base) ease-(--ease-emphasized)",
          "hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md",
          "focus-within:border-ring focus-within:shadow-md",
          "active:translate-y-0 active:shadow-xs",
        ],
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing)",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
        "[.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-lg leading-snug font-semibold text-foreground group-data-[size=sm]/card:text-base",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-pretty text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing)", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "mt-auto flex items-center gap-2 rounded-b-xl border-t border-border bg-surface-subtle p-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
