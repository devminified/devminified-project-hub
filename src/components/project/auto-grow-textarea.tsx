"use client"

import { useLayoutEffect, useRef } from "react"

import { cn } from "@/lib/utils"

/** How many lines the textarea grows to before it locks and scrolls internally. */
const MAX_VISIBLE_LINES = 4

/**
 * A textarea for free-text detail items. Width is fixed by the parent layout
 * (never expands horizontally); height starts at one line, grows with content
 * up to `MAX_VISIBLE_LINES`, then locks and scrolls internally.
 */
export function AutoGrowTextarea({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    // Reset before measuring: scrollHeight only ever reports a value >= the
    // current height, so without this the box can grow but never shrink back
    // down as text is deleted.
    el.style.height = "0px"

    const styles = window.getComputedStyle(el)
    const lineHeight = parseFloat(styles.lineHeight) || 20
    const borderY = parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth)
    const paddingY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom)
    const maxHeight = lineHeight * MAX_VISIBLE_LINES + borderY + paddingY

    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden"
  }, [value])

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "block resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm leading-6 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    />
  )
}
