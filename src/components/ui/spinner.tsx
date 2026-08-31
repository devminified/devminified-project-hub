import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

const sizes = {
  xs: "size-3",
  sm: "size-3.5",
  default: "size-4",
  lg: "size-5",
  xl: "size-8",
} as const

/**
 * Indeterminate progress indicator. Decorative by default — give it a
 * `label` when it is the only thing announcing that work is in flight.
 */
function Spinner({
  className,
  size = "default",
  label,
  ...props
}: Omit<React.ComponentProps<"svg">, "ref"> & {
  size?: keyof typeof sizes
  label?: string
}) {
  return (
    <>
      <Loader2Icon
        data-slot="spinner"
        aria-hidden="true"
        className={cn("animate-spin", sizes[size], className)}
        {...props}
      />
      {label ? (
        <span role="status" className="sr-only">
          {label}
        </span>
      ) : null}
    </>
  )
}

export { Spinner }
