"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Field label. Add `data-required` (or use <Field required>) to get the
 * asterisk; it is `aria-hidden` because the control itself carries `required`.
 */
function Label({
  className,
  children,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium text-foreground select-none",
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-55",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-55",
        "data-required:after:text-destructive data-required:after:content-['*']",
        className
      )}
      {...props}
    >
      {children}
    </label>
  )
}

export { Label }
