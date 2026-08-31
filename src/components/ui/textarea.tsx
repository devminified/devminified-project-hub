import * as React from "react"

import { cn } from "@/lib/utils"
import { fieldBase } from "@/components/ui/input"

/** Multi-line field. Matches Input's chrome, focus ring and disabled states. */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        fieldBase,
        "field-sizing-content min-h-20 resize-y px-3 py-2 text-sm leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
