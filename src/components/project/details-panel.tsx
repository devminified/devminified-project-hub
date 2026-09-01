"use client"

import { useState, useTransition } from "react"
import {
  ChevronDown,
  ExternalLink,
  FileText,
  Globe,
  GripVertical,
  Info,
  KeyRound,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { Reorder, useDragControls } from "motion/react"

import { cn } from "@/lib/utils"
import type { DetailEntry, ProjectSummary, RichDetailSection } from "@/lib/projects/types"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AutoGrowTextarea } from "./auto-grow-textarea"
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

function DetailSectionBlock({ section }: { section: RichDetailSection }) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
        {section.heading || "Untitled"}
      </h3>
      {section.items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">No items.</p>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {section.items.map((item, ii) =>
            typeof item === "string" ? (
              <DetailNoteCard key={ii} text={item} />
            ) : (
              <DetailItemCard key={ii} label={item.label} value={item.value} />
            )
          )}
        </div>
      )}
    </div>
  )
}

function DetailNoteCard({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:col-span-2">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <FileText className="size-5 text-slate-400" />
      </div>
      <p className="min-w-0 flex-1 text-sm whitespace-pre-wrap break-words text-slate-800">
        {text}
      </p>
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

/** A key/value detail row in the editor. */
type EditPairItem = { id: string; kind: "pair"; label: string; value: string }
/** A freeform text-note row in the editor. */
type EditTextItem = { id: string; kind: "text"; value: string }
type EditItem = EditPairItem | EditTextItem
type EditSection = { id: string; heading: string; items: EditItem[] }

function makeId() {
  return crypto.randomUUID()
}

function toEditItem(entry: DetailEntry): EditItem {
  return typeof entry === "string"
    ? { id: makeId(), kind: "text", value: entry }
    : { id: makeId(), kind: "pair", label: entry.label, value: entry.value }
}

function toDetailEntry(item: EditItem): DetailEntry {
  return item.kind === "text" ? item.value : { label: item.label, value: item.value }
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
  sections: RichDetailSection[]
}) {
  const [draft, setDraft] = useState<EditSection[]>(() =>
    sections.length > 0
      ? sections.map((s) => ({
          id: makeId(),
          heading: s.heading,
          items: s.items.map(toEditItem),
        }))
      : [
          {
            id: makeId(),
            heading: "",
            items: [{ id: makeId(), kind: "pair", label: "", value: "" }],
          },
        ]
  )
  const [error, setError] = useState<string | null>(null)
  const [pending, startSave] = useTransition()

  function updateSection(si: number, patch: Partial<EditSection>) {
    setDraft((prev) => prev.map((s, i) => (i === si ? { ...s, ...patch } : s)))
  }
  function updatePairItem(si: number, ii: number, patch: Partial<Omit<EditPairItem, "id" | "kind">>) {
    setDraft((prev) =>
      prev.map((s, i) =>
        i === si
          ? {
              ...s,
              items: s.items.map((it, j) =>
                j === ii && it.kind === "pair" ? { ...it, ...patch } : it
              ),
            }
          : s
      )
    )
  }
  function updateTextItem(si: number, ii: number, value: string) {
    setDraft((prev) =>
      prev.map((s, i) =>
        i === si
          ? {
              ...s,
              items: s.items.map((it, j) =>
                j === ii && it.kind === "text" ? { ...it, value } : it
              ),
            }
          : s
      )
    )
  }
  function addSection() {
    setDraft((prev) => [
      ...prev,
      {
        id: makeId(),
        heading: "",
        items: [{ id: makeId(), kind: "pair", label: "", value: "" }],
      },
    ])
  }
  function removeSection(si: number) {
    setDraft((prev) => prev.filter((_, i) => i !== si))
  }
  function addItem(si: number, kind: EditItem["kind"]) {
    setDraft((prev) =>
      prev.map((s, i) =>
        i === si
          ? {
              ...s,
              items: [
                ...s.items,
                kind === "pair"
                  ? { id: makeId(), kind: "pair", label: "", value: "" }
                  : { id: makeId(), kind: "text", value: "" },
              ],
            }
          : s
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
      const payload: RichDetailSection[] = draft.map((s) => ({
        heading: s.heading,
        items: s.items.map(toDetailEntry),
      }))
      const res = await updateProjectDetails(projectId, payload)
      if (res.error) setError(res.error)
      else onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl grid-rows-[auto_1fr_auto] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit details</DialogTitle>
          <DialogDescription>
            Add any number of headings, each with its own list of details — key/value
            pairs or freeform text notes. A value that starts with http(s):// is shown
            as a clickable link; anything else is shown as text.
          </DialogDescription>
        </DialogHeader>

        <Reorder.Group
          as="div"
          axis="y"
          values={draft}
          onReorder={setDraft}
          className="min-h-0 space-y-4 overflow-y-auto py-2 pr-1"
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
              updatePairItem={updatePairItem}
              updateTextItem={updateTextItem}
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

const ADD_ITEM_KIND_LABELS: Record<EditItem["kind"], string> = {
  pair: "KV Pair",
  text: "Text Note",
}
const ADD_ITEM_KIND_ICONS: Record<EditItem["kind"], typeof KeyRound> = {
  pair: KeyRound,
  text: FileText,
}

const ADD_ITEM_SEGMENT_CLASS =
  "flex cursor-pointer items-center gap-1.5 px-2.5 text-[0.8rem] font-medium whitespace-nowrap text-slate-600 select-none hover:bg-slate-100 hover:text-slate-800 aria-expanded:bg-slate-100 aria-expanded:text-slate-800 [&_svg]:size-3.5 [&_svg]:text-slate-400"

/**
 * A single merged split button: the left segment is a static "Add" action
 * (always adds the current `kind`); the right segment shows that kind and
 * opens a menu to change it, scoped to the section it belongs to.
 */
function AddItemButton({
  kind,
  onKindChange,
  onAdd,
}: {
  kind: EditItem["kind"]
  onKindChange: (kind: EditItem["kind"]) => void
  onAdd: (kind: EditItem["kind"]) => void
}) {
  const KindIcon = ADD_ITEM_KIND_ICONS[kind]

  return (
    <div className="inline-flex h-7 items-stretch overflow-hidden rounded-lg border border-slate-200 bg-white">
      <button type="button" onClick={() => onAdd(kind)} className={ADD_ITEM_SEGMENT_CLASS}>
        <Plus />
        Add
      </button>
      <span aria-hidden className="my-1.5 w-px bg-slate-200" />
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Item type to add: ${ADD_ITEM_KIND_LABELS[kind]}. Click to change.`}
          className={ADD_ITEM_SEGMENT_CLASS}
        >
          <KindIcon />
          {ADD_ITEM_KIND_LABELS[kind]}
          <ChevronDown />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup
            value={kind}
            onValueChange={(value) => onKindChange(value as EditItem["kind"])}
          >
            <DropdownMenuRadioItem value="pair" closeOnClick>
              <KeyRound className="size-3.5 text-slate-400" />
              KV Pair
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="text" closeOnClick>
              <FileText className="size-3.5 text-slate-400" />
              Text Note
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function EditSectionCard({
  section,
  si,
  updateSection,
  removeSection,
  updatePairItem,
  updateTextItem,
  addItem,
  removeItem,
  reorderItems,
}: {
  section: EditSection
  si: number
  updateSection: (si: number, patch: Partial<EditSection>) => void
  removeSection: (si: number) => void
  updatePairItem: (
    si: number,
    ii: number,
    patch: Partial<Omit<EditPairItem, "id" | "kind">>
  ) => void
  updateTextItem: (si: number, ii: number, value: string) => void
  addItem: (si: number, kind: EditItem["kind"]) => void
  removeItem: (si: number, ii: number) => void
  reorderItems: (si: number, items: EditItem[]) => void
}) {
  const dragControls = useDragControls()
  // Local to this section: which kind "Add item" adds next, defaulting to a pair.
  const [addKind, setAddKind] = useState<EditItem["kind"]>("pair")

  return (
    <Reorder.Item
      as="div"
      value={section}
      dragListener={false}
      dragControls={dragControls}
      transition={{ duration: 0 }}
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
            updatePairItem={updatePairItem}
            updateTextItem={updateTextItem}
            removeItem={removeItem}
          />
        ))}
        <AddItemButton kind={addKind} onKindChange={setAddKind} onAdd={(kind) => addItem(si, kind)} />
      </Reorder.Group>
    </Reorder.Item>
  )
}

function EditItemRow({
  item,
  si,
  ii,
  updatePairItem,
  updateTextItem,
  removeItem,
}: {
  item: EditItem
  si: number
  ii: number
  updatePairItem: (
    si: number,
    ii: number,
    patch: Partial<Omit<EditPairItem, "id" | "kind">>
  ) => void
  updateTextItem: (si: number, ii: number, value: string) => void
  removeItem: (si: number, ii: number) => void
}) {
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      as="div"
      value={item}
      dragListener={false}
      dragControls={dragControls}
      transition={{ duration: 0 }}
      className="flex items-start gap-2 bg-white"
    >
      <button
        type="button"
        onPointerDown={(e) => dragControls.start(e)}
        aria-label="Drag to reorder"
        className="mt-0.5 flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      {item.kind === "pair" ? (
        <>
          <Input
            value={item.label}
            onChange={(e) => updatePairItem(si, ii, { label: e.target.value })}
            placeholder="Label"
            className="h-9 w-1/3"
          />
          <Input
            value={item.value}
            onChange={(e) => updatePairItem(si, ii, { value: e.target.value })}
            placeholder="Value or https://…"
            className="h-9 flex-1"
          />
        </>
      ) : (
        <AutoGrowTextarea
          value={item.value}
          onChange={(value) => updateTextItem(si, ii, value)}
          placeholder="Text note…"
          className="flex-1"
        />
      )}
      <button
        type="button"
        onClick={() => removeItem(si, ii)}
        aria-label="Remove item"
        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="size-3.5" />
      </button>
    </Reorder.Item>
  )
}
