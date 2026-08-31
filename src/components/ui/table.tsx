"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Data table. The wrapper scrolls horizontally so a wide table never forces
 * the page sideways.
 *
 * @param density `default` (40px rows) or `compact` (32px) for dense lists.
 */
function Table({
  className,
  density = "default",
  containerClassName,
  ...props
}: React.ComponentProps<"table"> & {
  density?: "default" | "compact"
  containerClassName?: string
}) {
  return (
    <div
      data-slot="table-container"
      className={cn("relative w-full overflow-x-auto", containerClassName)}
    >
      <table
        data-slot="table"
        data-density={density}
        className={cn(
          "w-full caption-bottom border-collapse text-sm",
          "[--row-py:--spacing(2.5)] data-[density=compact]:[--row-py:--spacing(1.5)]",
          className
        )}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b [&_tr]:border-border", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-border bg-surface-subtle font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-border transition-colors duration-(--animate-duration-fast)",
        "hover:bg-surface-subtle has-aria-expanded:bg-surface-subtle data-[state=selected]:bg-accent",
        "focus-within:bg-surface-subtle",
        className
      )}
      {...props}
    />
  )
}

/** Header cell. Sticks to the top of a scrolling container. */
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-9 px-3 text-left align-middle text-2xs font-semibold tracking-wide whitespace-nowrap text-muted-foreground uppercase",
        "[&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-3 py-(--row-py) align-middle text-sm text-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
