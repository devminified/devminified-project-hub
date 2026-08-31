"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  InfoIcon,
  XCircleIcon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type ToastVariant = "default" | "success" | "warning" | "destructive" | "info"

type ToastOptions = {
  title: React.ReactNode
  description?: React.ReactNode
  variant?: ToastVariant
  /** Milliseconds before auto-dismiss. `0` keeps it until dismissed. */
  duration?: number
  action?: React.ReactNode
}

type ToastRecord = ToastOptions & { id: string }

/* -------------------------------------------------------------------------
   Store. Module-level so `toast()` works from any client code without a
   provider in scope — <Toaster /> only has to be mounted once.
   ---------------------------------------------------------------------- */
let toasts: ToastRecord[] = []
const listeners = new Set<(next: ToastRecord[]) => void>()
const MAX_VISIBLE = 4

function emit() {
  const snapshot = toasts
  listeners.forEach((l) => l(snapshot))
}

function dismiss(id: string) {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

function push(options: ToastOptions) {
  const id = Math.random().toString(36).slice(2)
  toasts = [...toasts, { ...options, id }].slice(-MAX_VISIBLE)
  emit()
  return id
}

type ToastFn = ((options: ToastOptions) => string) & {
  success: (title: React.ReactNode, options?: Omit<ToastOptions, "title" | "variant">) => string
  error: (title: React.ReactNode, options?: Omit<ToastOptions, "title" | "variant">) => string
  warning: (title: React.ReactNode, options?: Omit<ToastOptions, "title" | "variant">) => string
  info: (title: React.ReactNode, options?: Omit<ToastOptions, "title" | "variant">) => string
  dismiss: (id: string) => void
}

/**
 * Queue a toast from anywhere in client code.
 *
 * ```ts
 * toast.success("Project saved")
 * toast.error("Couldn't save", { description: err.message })
 * toast({ title: "Copied", duration: 1500 })
 * ```
 */
const toast = ((options: ToastOptions) => push(options)) as ToastFn
toast.success = (title, options) => push({ ...options, title, variant: "success" })
toast.error = (title, options) => push({ ...options, title, variant: "destructive" })
toast.warning = (title, options) => push({ ...options, title, variant: "warning" })
toast.info = (title, options) => push({ ...options, title, variant: "info" })
toast.dismiss = dismiss

/** Subscribe to the queue — handy for tests or a custom renderer. */
function useToast() {
  const list = React.useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange)
      return () => listeners.delete(onChange)
    },
    () => toasts,
    () => toasts
  )
  return { toasts: list, toast, dismiss }
}

/* ---------------------------------------------------------------------- */

const variantStyles: Record<ToastVariant, string> = {
  default: "border-border bg-popover text-popover-foreground",
  success: "border-success/30 bg-success-subtle text-success-subtle-foreground",
  warning: "border-warning/40 bg-warning-subtle text-warning-subtle-foreground",
  destructive:
    "border-destructive/30 bg-destructive-subtle text-destructive-subtle-foreground",
  info: "border-info/30 bg-info-subtle text-info-subtle-foreground",
}

const variantIcons: Record<ToastVariant, React.ElementType | null> = {
  default: null,
  success: CheckCircle2Icon,
  warning: AlertTriangleIcon,
  destructive: XCircleIcon,
  info: InfoIcon,
}

function ToastItem({ record }: { record: ToastRecord }) {
  const { id, title, description, variant = "default", duration = 4500, action } = record
  const Icon = variantIcons[variant]

  React.useEffect(() => {
    if (!duration) return
    const timer = window.setTimeout(() => dismiss(id), duration)
    return () => window.clearTimeout(timer)
  }, [id, duration])

  return (
    <motion.li
      layout
      data-slot="toast"
      data-variant={variant}
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
      className={cn(
        "pointer-events-auto flex w-full items-start gap-3 rounded-xl border p-3.5 shadow-lg",
        variantStyles[variant]
      )}
    >
      {Icon ? <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> : null}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-sm font-medium text-pretty">{title}</p>
        {description ? (
          <p className="text-xs text-pretty opacity-90">{description}</p>
        ) : null}
        {action ? <div className="mt-1 flex gap-2">{action}</div> : null}
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Dismiss notification"
        onClick={() => dismiss(id)}
        className="-mt-0.5 -mr-1 shrink-0 text-current hover:bg-foreground/10"
      >
        <XIcon />
      </Button>
    </motion.li>
  )
}

/**
 * Renders the toast stack. Mount exactly once, near the root of the app.
 * Bottom-centre on phones, bottom-right from `sm` up.
 */
function Toaster({ className, ...props }: React.ComponentProps<"div">) {
  const { toasts: list } = useToast()
  const hasUrgent = list.some((t) => t.variant === "destructive")

  return (
    <div
      data-slot="toaster"
      aria-live={hasUrgent ? "assertive" : "polite"}
      aria-relevant="additions text"
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-100 flex justify-center p-4 sm:inset-x-auto sm:right-0 sm:justify-end",
        className
      )}
      {...props}
    >
      <ul className="flex w-full max-w-sm flex-col-reverse gap-2">
        <AnimatePresence initial={false} mode="popLayout">
          {list.map((record) => (
            <ToastItem key={record.id} record={record} />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}

export { Toaster, toast, useToast, type ToastOptions, type ToastVariant }
