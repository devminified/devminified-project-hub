import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

/** Shared field chrome, so Input / Textarea / SelectTrigger stay in lockstep. */
const fieldBase = [
  "w-full min-w-0 rounded-lg border border-input bg-background text-foreground",
  "transition-[color,box-shadow,border-color] duration-(--animate-duration-fast) ease-(--ease-standard)",
  "outline-none focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring",
  "hover:not-disabled:not-aria-[invalid=true]:border-border-strong",
  "placeholder:text-muted-foreground",
  "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted-foreground disabled:opacity-70",
  "aria-invalid:border-destructive aria-invalid:outline-destructive",
  "read-only:bg-surface-subtle",
]

const inputSizes = {
  sm: "h-8 px-2.5 text-xs",
  default: "h-9 px-3 text-sm",
  lg: "h-11 px-3.5 text-base",
} as const

/**
 * @param inputSize Control density. `default` (36px) matches Button's default
 *   size, so an input and its adjacent button line up without overrides.
 */
function Input({
  className,
  type,
  inputSize = "default",
  ...props
}: React.ComponentProps<"input"> & { inputSize?: keyof typeof inputSizes }) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      data-size={inputSize}
      className={cn(
        fieldBase,
        inputSizes[inputSize],
        // File inputs need their own button chrome.
        "file:mr-3 file:inline-flex file:h-full file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Input, fieldBase }
