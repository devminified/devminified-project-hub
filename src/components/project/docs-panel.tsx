"use client"

import { useState, useTransition } from "react"
import { Download, FileText, Upload } from "lucide-react"

import type { Component, DocRecord } from "@/lib/projects/types"
import {
  createDoc,
  createDocsBulk,
  deleteDoc,
  updateDoc,
} from "@/app/(app)/projects/actions"
import { useActionDialog } from "@/hooks/use-action-dialog"
import { useConfirm } from "@/hooks/use-confirm"
import { useDisclosure } from "@/hooks/use-disclosure"
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
import { AddButton, EmptyState, Panel, RowActions } from "./shared"
import {
  ComponentBadge,
  ComponentField,
  ComponentFilter,
  componentLabel,
  matchesComponent,
  type ComponentTab,
} from "./component-filter"
import { downloadText, textareaClass } from "./utils"

export function DocsPanel({
  docs,
  projectId,
  canEdit,
}: {
  docs: DocRecord[]
  projectId: string
  canEdit: boolean
}) {
  const [dialog, setDialog] = useState<{ open: boolean; doc: DocRecord | null }>({
    open: false,
    doc: null,
  })
  const upload = useDisclosure()
  const [view, setView] = useState<DocRecord | null>(null)
  const [comp, setComp] = useState<ComponentTab>("All")
  const { confirm, dialog: confirmDialog } = useConfirm()
  const [, startDelete] = useTransition()

  const filtered = docs.filter((d) => matchesComponent(d.component, comp))
  const componentCountFor = (tab: ComponentTab) =>
    docs.filter((d) => matchesComponent(d.component, tab)).length

  return (
    <Panel
      title="Documentation"
      description="Guides, references, and runbooks for this project."
      action={
        canEdit && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={upload.onOpen} className="gap-1.5">
              <Upload className="size-3.5" />
              Upload files
            </Button>
            <AddButton label="Add doc" onClick={() => setDialog({ open: true, doc: null })} />
          </div>
        )
      }
    >
      <div className="mb-4">
        <ComponentFilter active={comp} onChange={setComp} countFor={componentCountFor} />
      </div>

      {docs.length === 0 ? (
        <EmptyState message="No documentation yet." />
      ) : filtered.length === 0 ? (
        <EmptyState message={`No ${componentLabel[comp as "FRONTEND"] ?? "matching"} docs.`} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="group flex items-start gap-3 rounded-lg border border-slate-200 p-4 transition-all hover:border-blue-300 hover:bg-blue-50/40"
            >
              <button
                type="button"
                onClick={() => setView(doc)}
                className="flex min-w-0 flex-1 items-start gap-3 text-left"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <FileText className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-slate-800 group-hover:text-[var(--brand-blue)]">
                      {doc.title}
                    </p>
                    <ComponentBadge component={doc.component} />
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{doc.description}</p>
                  <p className="mt-2 text-xs text-slate-400">Updated {doc.updatedAt}</p>
                </div>
              </button>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => downloadText(doc.title, doc.description)}
                  aria-label="Download"
                  className="flex size-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-[var(--brand-blue)]"
                >
                  <Download className="size-3.5" />
                </button>
                {canEdit && (
                  <RowActions
                    onEdit={() => setDialog({ open: true, doc })}
                    onDelete={async () => {
                      const ok = await confirm({
                        title: "Delete document?",
                        description: `Delete "${doc.title}"? This can't be undone.`,
                        confirmLabel: "Delete",
                        destructive: true,
                      })
                      if (ok) startDelete(() => deleteDoc(doc.id).then(() => {}))
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <DocDialog
        key={dialog.doc?.id ?? "create"}
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        doc={dialog.doc}
        projectId={projectId}
      />
      <UploadDocsDialog
        key={upload.open ? "upload-open" : "upload-closed"}
        open={upload.open}
        onOpenChange={upload.setOpen}
        projectId={projectId}
      />
      <DocViewDialog doc={view} onClose={() => setView(null)} />
      {confirmDialog}
    </Panel>
  )
}

function DocViewDialog({
  doc,
  onClose,
}: {
  doc: DocRecord | null
  onClose: () => void
}) {
  return (
    <Dialog open={Boolean(doc)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        {doc && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <FileText className="size-5 text-blue-500" />
                {doc.title}
                <ComponentBadge component={doc.component} />
              </DialogTitle>
              <DialogDescription>Updated {doc.updatedAt}</DialogDescription>
            </DialogHeader>

            <div className="py-2">
              {doc.description ? (
                <pre className="max-h-[70vh] min-h-[40vh] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-5 font-mono text-sm leading-relaxed text-slate-700">
                  {doc.description}
                </pre>
              ) : (
                <p className="rounded-lg border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
                  This document has no content. Edit it to add details.
                </p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                onClick={() => downloadText(doc.title, doc.description)}
                className="gap-1.5 bg-[var(--brand-primary)] text-white"
              >
                <Download className="size-4" />
                Download
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function UploadDocsDialog({
  open,
  onOpenChange,
  projectId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
}) {
  const [files, setFiles] = useState<{ title: string; content: string }[]>([])
  const [component, setComponent] = useState<string>("none")
  const [error, setError] = useState<string | null>(null)
  const [reading, setReading] = useState(false)
  const [pending, startUpload] = useTransition()

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files
    if (!list || list.length === 0) {
      setFiles([])
      return
    }
    setReading(true)
    setError(null)
    try {
      const read = await Promise.all(
        Array.from(list).map(async (f) => ({
          title: f.name,
          content: await f.text(),
        }))
      )
      setFiles(read)
    } catch {
      setError("Could not read one or more files.")
    } finally {
      setReading(false)
    }
  }

  function handleSubmit() {
    if (files.length === 0) {
      setError("Select one or more files first.")
      return
    }
    const comp = component === "none" ? null : (component as Component)
    startUpload(async () => {
      const res = await createDocsBulk(projectId, files, comp)
      if (res.error) setError(res.error)
      else onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload documentation files</DialogTitle>
          <DialogDescription>
            Select multiple files — a documentation entry is created for each,
            named after the file and storing its contents.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label>Component</Label>
            <Select value={component} onValueChange={(v) => setComponent(v ?? "none")}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="FRONTEND">Frontend</SelectItem>
                <SelectItem value="BACKEND">Backend</SelectItem>
                <SelectItem value="DB">DB</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/40">
            <Upload className="size-6 text-blue-500" />
            <span className="text-sm font-medium text-slate-700">Click to choose files</span>
            <span className="text-xs text-slate-400">Markdown / text files work best</span>
            <input
              type="file"
              multiple
              accept=".md,.markdown,.txt,.json,.yml,.yaml,text/*"
              className="hidden"
              onChange={handleFiles}
            />
          </label>

          {reading && <p className="text-sm text-slate-500">Reading files…</p>}

          {files.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {files.length} {files.length === 1 ? "file" : "files"} ready
              </p>
              <ul className="max-h-40 space-y-1 overflow-y-auto">
                {files.map((f, i) => (
                  <li
                    key={`${f.title}-${i}`}
                    className="flex items-center gap-2 rounded-md bg-slate-50 px-2.5 py-1.5 text-sm text-slate-700"
                  >
                    <FileText className="size-3.5 shrink-0 text-blue-500" />
                    <span className="truncate">{f.title}</span>
                    <span className="ml-auto shrink-0 text-xs text-slate-400">
                      {f.content.length} chars
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={pending || reading || files.length === 0}
            className="bg-[var(--brand-primary)] text-white"
          >
            {pending
              ? "Adding…"
              : `Add ${files.length || ""} ${files.length === 1 ? "doc" : "docs"}`.trim()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DocDialog({
  open,
  onOpenChange,
  doc,
  projectId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  doc: DocRecord | null
  projectId: string
}) {
  const isEdit = Boolean(doc)
  const { state, formAction, pending } = useActionDialog(
    isEdit ? updateDoc : createDoc,
    () => onOpenChange(false)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit doc" : "Add doc"}</DialogTitle>
            <DialogDescription>A guide or reference for this project.</DialogDescription>
          </DialogHeader>
          {isEdit ? (
            <input type="hidden" name="id" value={doc!.id} />
          ) : (
            <input type="hidden" name="projectId" value={projectId} />
          )}
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={doc?.title ?? ""}
                placeholder="Architecture Overview"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                rows={6}
                defaultValue={doc?.description ?? ""}
                placeholder="What does this document cover?"
                className={`${textareaClass} min-h-32`}
              />
            </div>
            <ComponentField defaultValue={doc?.component} />
            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="bg-[var(--brand-primary)] text-white"
            >
              {pending ? "Saving…" : isEdit ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
