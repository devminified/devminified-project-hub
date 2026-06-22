"use client"

import { Pencil, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EmptyResult } from "@/components/empty-result"

/** Card shell with a titled header and an optional header action slot. */
export function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string
  description: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

export function EmptyState({ message }: { message: string }) {
  return <EmptyResult title={message} size="sm" />
}

export function AddButton({
  onClick,
  label,
}: {
  onClick: () => void
  label: string
}) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      className="gap-1.5 bg-[var(--brand-primary)] text-white"
    >
      <Plus className="size-3.5" />
      {label}
    </Button>
  )
}

export function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit"
        className="flex size-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-[var(--brand-blue)]"
      >
        <Pencil className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete"
        className="flex size-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  )
}
