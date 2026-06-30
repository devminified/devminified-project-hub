"use client"

import { useState, useTransition } from "react"
import { Check, Pencil, Plus, Trash2, X } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ProjectTab, TabFeature } from "@/lib/projects/types"
import { createTab, deleteTab, renameTab } from "@/app/(app)/projects/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/** Sentinel for the "show everything" pill. */
export const ALL_TAB = "all"

/** Rotating badge palette — tabs are colored by their order, cycling. */
const TAB_COLORS = [
  "bg-violet-50 text-violet-700 ring-violet-200",
  "bg-orange-50 text-orange-700 ring-orange-200",
  "bg-teal-50 text-teal-700 ring-teal-200",
  "bg-blue-50 text-blue-700 ring-blue-200",
  "bg-rose-50 text-rose-700 ring-rose-200",
  "bg-amber-50 text-amber-700 ring-amber-200",
  "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
]

export function tabColor(order: number) {
  return TAB_COLORS[((order % TAB_COLORS.length) + TAB_COLORS.length) % TAB_COLORS.length]
}

export function matchesTab(itemTabId: string | null, activeId: string) {
  return activeId === ALL_TAB || itemTabId === activeId
}

/** Build a quick id→tab lookup for rendering badges. */
export function tabLookup(tabs: ProjectTab[]) {
  return new Map(tabs.map((t) => [t.id, t]))
}

/** A colored pill for a record's tab. Renders nothing when uncategorized. */
export function TabBadge({ tab }: { tab: ProjectTab | undefined }) {
  if (!tab) return null
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        tabColor(tab.order)
      )}
    >
      {tab.name}
    </span>
  )
}

/**
 * The filter bar: an "All" pill, one pill per project tab (with a count), and —
 * when the viewer can edit — a button that opens the manage-tabs dialog.
 */
export function TabFilter({
  tabs,
  activeId,
  onChange,
  countFor,
  canEdit,
  projectId,
  feature,
}: {
  tabs: ProjectTab[]
  activeId: string
  onChange: (id: string) => void
  countFor: (id: string) => number
  canEdit: boolean
  projectId: string
  feature: TabFeature
}) {
  const [manage, setManage] = useState(false)
  const pills: { id: string; label: string }[] = [
    { id: ALL_TAB, label: "All" },
    ...tabs.map((t) => ({ id: t.id, label: t.name })),
  ]

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {pills.map((pill) => {
        const isActive = activeId === pill.id
        return (
          <button
            key={pill.id}
            type="button"
            onClick={() => onChange(pill.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {pill.label}
            <span
              className={cn(
                "rounded-full px-1.5 text-[10px] font-semibold",
                isActive ? "bg-white/25 text-white" : "bg-white text-slate-500"
              )}
            >
              {countFor(pill.id)}
            </span>
          </button>
        )
      })}

      {canEdit && (
        <button
          type="button"
          onClick={() => setManage(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-blue-300 hover:bg-blue-50/50 hover:text-[var(--brand-blue)]"
        >
          <Pencil className="size-3.5" />
          Edit tabs
        </button>
      )}

      {canEdit && (
        <ManageTabsDialog
          open={manage}
          onOpenChange={setManage}
          tabs={tabs}
          projectId={projectId}
          feature={feature}
        />
      )}
    </div>
  )
}

/**
 * A `<Select name="tabId">` for the add/edit dialogs, listing this feature's
 * tabs plus a "None" option.
 */
export function TabField({
  tabs,
  defaultValue,
  label = "Tab",
}: {
  tabs: ProjectTab[]
  defaultValue?: string | null
  label?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="tabId">{label}</Label>
      <Select name="tabId" defaultValue={defaultValue ?? "none"}>
        <SelectTrigger id="tabId" className="h-10 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {tabs.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

const featureNoun: Record<TabFeature, string> = {
  DOC: "documentation",
  ENV: "environment variables",
  README: "READMEs",
}

function ManageTabsDialog({
  open,
  onOpenChange,
  tabs,
  projectId,
  feature,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tabs: ProjectTab[]
  projectId: string
  feature: TabFeature
}) {
  const [newName, setNewName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function handleAdd() {
    const name = newName.trim()
    if (!name) return
    setError(null)
    start(async () => {
      const res = await createTab(projectId, feature, name)
      if (res.error) setError(res.error)
      else setNewName("")
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit tabs</DialogTitle>
          <DialogDescription>
            Add, rename, or remove the tabs used to organize this project&apos;s{" "}
            {featureNoun[feature]}. Removing a tab keeps its items — they just
            become uncategorized.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {tabs.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">
              No tabs yet. Add one below.
            </p>
          ) : (
            tabs.map((tab) => (
              <TabRow key={tab.id} tab={tab} disabled={pending} onError={setError} />
            ))
          )}

          <div className="flex items-center gap-2 pt-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAdd()
                }
              }}
              placeholder="New tab name (e.g. Admin, UAT Frontend)"
              className="h-10"
            />
            <Button
              type="button"
              onClick={handleAdd}
              disabled={pending || !newName.trim()}
              className="shrink-0 gap-1.5 bg-[var(--brand-primary)] text-white"
            >
              <Plus className="size-4" />
              Add
            </Button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function TabRow({
  tab,
  disabled,
  onError,
}: {
  tab: ProjectTab
  disabled: boolean
  onError: (msg: string | null) => void
}) {
  const [name, setName] = useState(tab.name)
  const [confirming, setConfirming] = useState(false)
  const [pending, start] = useTransition()
  const dirty = name.trim() !== tab.name && name.trim().length > 0

  function save() {
    if (!dirty) return
    onError(null)
    start(async () => {
      const res = await renameTab(tab.id, name.trim())
      if (res.error) {
        onError(res.error)
        setName(tab.name)
      }
    })
  }

  function remove() {
    onError(null)
    start(async () => {
      const res = await deleteTab(tab.id)
      if (res.error) onError(res.error)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn("size-2.5 shrink-0 rounded-full ring-1 ring-inset", tabColor(tab.order))}
        aria-hidden
      />
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            save()
          }
        }}
        disabled={disabled || pending}
        className="h-9"
      />
      {dirty && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={save}
          disabled={pending}
          className="shrink-0 gap-1"
        >
          <Check className="size-3.5" />
          Save
        </Button>
      )}
      {confirming ? (
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            size="sm"
            onClick={remove}
            disabled={pending}
            className="gap-1 bg-red-600 text-white hover:bg-red-700"
          >
            <Trash2 className="size-3.5" />
            Delete
          </Button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            aria-label="Cancel"
            className="flex size-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={pending}
          aria-label={`Delete ${tab.name} tab`}
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  )
}
