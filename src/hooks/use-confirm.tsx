"use client"

import { useCallback, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ConfirmOptions = {
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

/**
 * Promise-based confirmation modal — a drop-in replacement for window.confirm().
 * Returns `{ confirm, dialog }`; render `{dialog}` once in the component and
 * `await confirm({ ... })` to get a boolean.
 */
export function useConfirm() {
  const [state, setState] = useState<{ open: boolean; options: ConfirmOptions }>({
    open: false,
    options: {},
  })
  const resolver = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((options: ConfirmOptions = {}) => {
    setState({ open: true, options })
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const settle = useCallback((result: boolean) => {
    setState((s) => ({ ...s, open: false }))
    resolver.current?.(result)
    resolver.current = null
  }, [])

  const { title, description, confirmLabel, cancelLabel, destructive } =
    state.options

  const dialog = (
    <Dialog open={state.open} onOpenChange={(open) => !open && settle(false)}>
      <DialogContent showCloseButton={false} className="h-auto max-w-md">
        <DialogHeader>
          <DialogTitle>{title ?? "Are you sure?"}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => settle(false)}>
            {cancelLabel ?? "Cancel"}
          </Button>
          <Button
            onClick={() => settle(true)}
            className={cn(
              destructive
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-[var(--brand-primary)] text-white hover:opacity-90"
            )}
          >
            {confirmLabel ?? "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return { confirm, dialog }
}
