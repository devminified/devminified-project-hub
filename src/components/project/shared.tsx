"use client"

import { Pencil, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EmptyState as EmptyStatePrimitive } from "@/components/ui/empty-state"

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
    <Card variant="elevated">
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className="min-w-0">{children}</CardContent>
    </Card>
  )
}

export function EmptyState({ message }: { message: string }) {
  return <EmptyStatePrimitive title={message} size="sm" />
}

export function AddButton({
  onClick,
  label,
}: {
  onClick: () => void
  label: string
}) {
  return (
    <Button size="sm" onClick={onClick}>
      <Plus />
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
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onEdit}
        aria-label="Edit"
        className="text-muted-foreground hover:text-foreground"
      >
        <Pencil />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onDelete}
        aria-label="Delete"
        className="text-muted-foreground hover:bg-destructive-subtle hover:text-destructive-subtle-foreground"
      >
        <Trash2 />
      </Button>
    </div>
  )
}
