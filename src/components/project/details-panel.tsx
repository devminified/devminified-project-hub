"use client"

import { useState, useTransition } from "react"
import { ExternalLink, Globe, GripVertical, Info, Pencil, Plus, Trash2 } from "lucide-react"
import { Reorder, useDragControls } from "motion/react"

import { cn } from "@/lib/utils"
import type { DetailSection, ProjectSummary } from "@/lib/projects/types"
import { updateProjectDetails } from "@/app/(app)/projects/actions"
import { useDisclosure } from "@/hooks/use-disclosure"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Panel } from "./shared"
import { isUrl } from "./utils"

export function DetailsPanel({
  summary,
  canEdit,
}: {
  summary: ProjectSummary
  canEdit: boolean
}) {
  const edit = useDisclosure()
  const sections = summary.detailSections

  return (
    <Panel
      title="Details"
      description="Project overview and custom detail sections."
      action={
        canEdit && (
          <Button
            size="sm"
            variant="outline"
            onClick={edit.onOpen}
            className="gap-1.5"
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>
        )
      }
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
            Description
          </h3>
          {summary.description ? (
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {summary.description}
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-400">No description yet.</p>
          )}
        </div>

        {sections.length === 0 ? (
          <p className="text-sm text-slate-400">
            {canEdit
              ? "No detail sections yet. Use Edit to add headings (e.g. URLs, Credentials, Links) with any details below them."
              : "No detail sections yet."}
          </p>
        ) : (
          sections.map((section, si) => <DetailSectionBlock key={si} section={section} />)
        )}
      </div>

      <DetailsEditDialog
        key={edit.open ? "edit-open" : "edit-closed"}
        open={edit.open}
        onOpenChange={edit.setOpen}
        projectId={summary.id}
        sections={sections}
      />
    </Panel>
  )
}

function DetailSectionBlock({ section }: { section: DetailSection }) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
        {section.heading || "Untitled"}
      </h3>
      {section.items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">No items.</p>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {section.items.map((item, ii) => (
            <DetailItemCard key={ii} label={item.label} value={item.value} />
          ))}
        </div>
      )}
    </div>
  )
}

function DetailItemCard({ label, value }: { label: string; value: string }) {
  const linked = isUrl(value)
  const content = (
    <>
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg text-white",
          linked
            ? "bg-gradient-to-br from-[var(--brand-blue)] to-[var(--brand-primary)]"
            : "bg-slate-100 text-slate-500"
        )}
      >
        {linked ? <Globe className="size-5" /> : <Info className="size-5 text-slate-400" />}
      </div>
      <div className="min-w-0 flex-1">
        {label && <p className="text-xs font-medium text-slate-500">{label}</p>}
        <p
          className={cn(
            "text-sm font-semibold text-slate-800",
            linked
              ? "truncate group-hover:text-[var(--brand-blue)]"
              : "whitespace-pre-wrap break-words"
          )}
        >
          {value || "—"}
        </p>
      </div>
      {linked && (
        <ExternalLink className="size-4 shrink-0 text-slate-300 transition-colors group-hover:text-[var(--brand-blue)]" />
      )}
    </>
  )

  if (linked) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md"
      >
        {content}
      </a>
    )
  }
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
      {content}
    </div>
  )
}

type EditItem = { id: string; label: string; value: string }
type EditSection = { id: string; heading: string; items: EditItem[] }

function makeId() {
  return crypto.randomUUID()
}

function DetailsEditDialog({
  open,
  onOpenChange,
  projectId,
  sections,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  sections: DetailSection[]
}) {
  const [draft, setDraft] = useState<EditSection[]>(() =>
    sections.length > 0
      ? sections.map((s) => ({
          id: makeId(),
          heading: s.heading,
          items: s.items.map((i) => ({ id: makeId(), label: i.label, value: i.value })),
        }))
      : [{ id: makeId(), heading: "", items: [{ id: makeId(), label: "", value: "" }] }]
  )
  const [error, setError] = useState<string | null>(null)
  const [pending, startSave] = useTransition()

  function updateSection(si: number, patch: Partial<EditSection>) {
    setDraft((prev) => prev.map((s, i) => (i === si ? { ...s, ...patch } : s)))
  }
  function updateItem(
    si: number,
    ii: number,
    patch: Partial<EditSection["items"][number]>
  ) {
    setDraft((prev) =>
      prev.map((s, i) =>
        i === si
          ? { ...s, items: s.items.map((it, j) => (j === ii ? { ...it, ...patch } : it)) }
          : s
      )
    )
  }
  function addSection() {
    setDraft((prev) => [
      ...prev,
      { id: makeId(), heading: "", items: [{ id: makeId(), label: "", value: "" }] },
    ])
  }
  function removeSection(si: number) {
    setDraft((prev) => prev.filter((_, i) => i !== si))
  }
  function addItem(si: number) {
    setDraft((prev) =>
      prev.map((s, i) =>
        i === si ? { ...s, items: [...s.items, { id: makeId(), label: "", value: "" }] } : s
      )
    )
  }
  function removeItem(si: number, ii: number) {
    setDraft((prev) =>
      prev.map((s, i) =>
        i === si ? { ...s, items: s.items.filter((_, j) => j !== ii) } : s
      )
    )
  }
  function reorderItems(si: number, items: EditItem[]) {
    setDraft((prev) => prev.map((s, i) => (i === si ? { ...s, items } : s)))
  }

  function handleSave() {
    setError(null)
    startSave(async () => {
      const res = await updateProjectDetails(projectId, draft)
      if (res.error) setError(res.error)
      else onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit details</DialogTitle>
          <DialogDescription>
            Add any number of headings, each with its own list of details. A value
            that starts with http(s):// is shown as a clickable link; anything else
            is shown as text.
          </DialogDescription>
        </DialogHeader>

        <Reorder.Group
          as="div"
          axis="y"
          values={draft}
          onReorder={setDraft}
          className="max-h-[60vh] space-y-4 overflow-y-auto py-2 pr-1"
        >
          {draft.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
              No sections. Add a heading to get started.
            </p>
          )}

          {draft.map((section, si) => (
            <EditSectionCard
              key={section.id}
              section={section}
              si={si}
              updateSection={updateSection}
              removeSection={removeSection}
              updateItem={updateItem}
              addItem={addItem}
              removeItem={removeItem}
              reorderItems={reorderItems}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addSection}
            className="w-full gap-1.5 border-dashed"
          >
            <Plus className="size-4" />
            Add heading
          </Button>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </Reorder.Group>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="bg-[var(--brand-primary)] text-white"
          >
            {pending ? "Saving…" : "Save details"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditSectionCard({
  section,
  si,
  updateSection,
  removeSection,
  updateItem,
  addItem,
  removeItem,
  reorderItems,
}: {
  section: EditSection
  si: number
  updateSection: (si: number, patch: Partial<EditSection>) => void
  removeSection: (si: number) => void
  updateItem: (si: number, ii: number, patch: Partial<EditSection["items"][number]>) => void
  addItem: (si: number) => void
  removeItem: (si: number, ii: number) => void
  reorderItems: (si: number, items: EditItem[]) => void
}) {
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      as="div"
      value={section}
      dragListener={false}
      dragControls={dragControls}
      className="rounded-xl border border-slate-200 bg-white p-4"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onPointerDown={(e) => dragControls.start(e)}
          aria-label="Drag to reorder"
          className="flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
        <Input
          value={section.heading}
          onChange={(e) => updateSection(si, { heading: e.target.value })}
          placeholder="Heading (e.g. URLs, Credentials, Notes)"
          className="h-9 font-medium"
        />
        <button
          type="button"
          onClick={() => removeSection(si)}
          aria-label="Remove heading"
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <Reorder.Group
        as="div"
        axis="y"
        values={section.items}
        onReorder={(items) => reorderItems(si, items)}
        className="mt-3 space-y-2"
      >
        {section.items.map((item, ii) => (
          <EditItemRow
            key={item.id}
            item={item}
            si={si}
            ii={ii}
            updateItem={updateItem}
            removeItem={removeItem}
          />
        ))}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => addItem(si)}
          className="gap-1.5"
        >
          <Plus className="size-3.5" />
          Add item
        </Button>
      </Reorder.Group>
    </Reorder.Item>
  )
}

function EditItemRow({
  item,
  si,
  ii,
  updateItem,
  removeItem,
}: {
  item: EditSection["items"][number]
  si: number
  ii: number
  updateItem: (si: number, ii: number, patch: Partial<EditSection["items"][number]>) => void
  removeItem: (si: number, ii: number) => void
}) {
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      as="div"
      value={item}
      dragListener={false}
      dragControls={dragControls}
      className="flex items-center gap-2 bg-white"
    >
      <button
        type="button"
        onPointerDown={(e) => dragControls.start(e)}
        aria-label="Drag to reorder"
        className="flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      <Input
        value={item.label}
        onChange={(e) => updateItem(si, ii, { label: e.target.value })}
        placeholder="Label"
        className="h-9 w-1/3"
      />
      <Input
        value={item.value}
        onChange={(e) => updateItem(si, ii, { value: e.target.value })}
        placeholder="Value or https://…"
        className="h-9 flex-1"
      />
      <button
        type="button"
        onClick={() => removeItem(si, ii)}
        aria-label="Remove item"
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="size-3.5" />
      </button>
    </Reorder.Item>
  )
}
