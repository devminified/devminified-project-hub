import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 cursor-pointer items-center justify-center",
    "rounded-lg border border-transparent bg-clip-padding font-medium whitespace-nowrap select-none",
    // One transition definition for every variant: colour + shadow + the 1px
    // press travel. Duration comes from the motion scale.
    "transition-[color,background-color,border-color,box-shadow,translate] duration-(--animate-duration-fast) ease-(--ease-standard)",
    // Focus: the app-wide 2px offset ring. `outline-none` first so the UA ring
    // never doubles up.
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    // Press feedback, suppressed for menu/popover triggers so the anchor
    // doesn't jump under the popup.
    "active:not-aria-[haspopup]:translate-y-px",
    // Disabled + loading read the same to the eye; only `disabled` blocks input.
    "disabled:pointer-events-none disabled:opacity-55 disabled:shadow-none",
    "aria-disabled:pointer-events-none aria-disabled:opacity-55",
    "data-loading:pointer-events-none data-loading:opacity-80",
    "aria-invalid:border-destructive aria-invalid:outline-destructive",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover active:bg-primary-hover",
        outline:
          "border-border-strong bg-background text-foreground shadow-2xs hover:bg-surface-muted aria-expanded:bg-surface-muted",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent",
        ghost:
          "text-foreground hover:bg-surface-muted aria-expanded:bg-surface-muted",
        /** Tinted danger — the default for destructive actions in a toolbar. */
        destructive:
          "bg-destructive-subtle text-destructive-subtle-foreground hover:bg-destructive-subtle-foreground/15 focus-visible:outline-destructive",
        /** Solid danger — for the confirming button inside a destructive dialog. */
        "destructive-solid":
          "bg-destructive text-destructive-foreground shadow-xs hover:brightness-110 focus-visible:outline-destructive",
        /** Quiet brand emphasis: reads as primary without competing with it. */
        soft: "bg-primary-subtle text-primary-subtle-foreground hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 gap-1 rounded-md px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 rounded-md px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        default:
          "h-9 gap-1.5 px-3 text-sm has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        lg: "h-10 gap-2 px-4 text-sm has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xl: "h-11 gap-2 rounded-xl px-5 text-base [&_svg:not([class*='size-'])]:size-4.5",
        icon: "size-9",
        "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 rounded-md [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-10",
        "icon-xl": "size-11 rounded-xl [&_svg:not([class*='size-'])]:size-4.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * @param loading Swaps the leading content for a spinner, sets `aria-busy`,
 *   and blocks interaction. The label stays put so the button keeps its size.
 */
function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & { loading?: boolean }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : null}
      {children as React.ReactNode}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
