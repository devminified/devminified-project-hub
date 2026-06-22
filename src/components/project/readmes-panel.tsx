"use client"

import { useState, useTransition } from "react"
import { ScrollText, Upload } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Component, ReadmeRecord } from "@/lib/projects/types"
import {
  createReadme,
  createReadmesBulk,
  deleteReadme,
  updateReadme,
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
  matchesComponent,
  type ComponentTab,
} from "./component-filter"
import { textareaClass } from "./utils"

export function ReadmesPanel({
  readmes,
  projectId,
  isAdmin,
}: {
  readmes: ReadmeRecord[]
  projectId: string
  isAdmin: boolean
}) {
  const [dialog, setDialog] = useState<{ open: boolean; readme: ReadmeRecord | null }>({
    open: false,
    readme: null,
  })
  const upload = useDisclosure()
  const [comp, setComp] = useState<ComponentTab>("All")
  const { confirm, dialog: confirmDialog } = useConfirm()
  const [, startDelete] = useTransition()

  const filtered = readmes.filter((r) => matchesComponent(r.component, comp))
  const componentCountFor = (tab: ComponentTab) =>
    readmes.filter((r) => matchesComponent(r.component, tab)).length

  return (
    <Panel
      title="READMEs"
      description="Markdown files that describe and onboard this project."
      action={
        isAdmin && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={upload.onOpen} className="gap-1.5">
              <Upload className="size-3.5" />
              Upload files
            </Button>
            <AddButton
              label="Add readme"
              onClick={() => setDialog({ open: true, readme: null })}
            />
          </div>
        )
      }
    >
      <div className="mb-4">
        <ComponentFilter active={comp} onChange={setComp} countFor={componentCountFor} />
      </div>

      {readmes.length === 0 ? (
        <EmptyState message="No readme files yet." />
      ) : filtered.length === 0 ? (
        <EmptyState message="No matching readmes." />
      ) : (
        <div className="space-y-4">
          {filtered.map((readme) => (
            <div key={readme.id} className="overflow-hidden rounded-lg border border-slate-200">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <ScrollText className="size-4 text-blue-500" />
                  <span className="font-mono text-xs font-medium text-slate-700">
                    {readme.title}
                  </span>
                  <ComponentBadge component={readme.component} />
                </div>
                {isAdmin && (
                  <RowActions
                    onEdit={() => setDialog({ open: true, readme })}
                    onDelete={async () => {
                      const ok = await confirm({
                        title: "Delete readme?",
                        description: `Delete "${readme.title}"? This can't be undone.`,
                        confirmLabel: "Delete",
                        destructive: true,
                      })
                      if (ok) startDelete(() => deleteReadme(readme.id).then(() => {}))
                    }}
                  />
                )}
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-slate-700">
                {readme.content}
              </pre>
            </div>
          ))}
        </div>
      )}

      <ReadmeDialog
        key={dialog.readme?.id ?? "create"}
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        readme={dialog.readme}
        projectId={projectId}
      />
      <UploadReadmesDialog
        key={upload.open ? "upload-open" : "upload-closed"}
        open={upload.open}
        onOpenChange={upload.setOpen}
        projectId={projectId}
      />
      {confirmDialog}
    </Panel>
  )
}

function UploadReadmesDialog({
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
      const res = await createReadmesBulk(projectId, files, comp)
      if (res.error) setError(res.error)
      else onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload readme files</DialogTitle>
          <DialogDescription>
            Select multiple files — each is added as a readme using its file name
            and contents.
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
              accept=".md,.markdown,.txt,text/*"
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
                    <ScrollText className="size-3.5 shrink-0 text-blue-500" />
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
              : `Add ${files.length || ""} ${files.length === 1 ? "readme" : "readmes"}`.trim()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ReadmeDialog({
  open,
  onOpenChange,
  readme,
  projectId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  readme: ReadmeRecord | null
  projectId: string
}) {
  const isEdit = Boolean(readme)
  const { state, formAction, pending } = useActionDialog(
    isEdit ? updateReadme : createReadme,
    () => onOpenChange(false)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit readme" : "Add readme"}</DialogTitle>
            <DialogDescription>A markdown file for this project.</DialogDescription>
          </DialogHeader>
          {isEdit ? (
            <input type="hidden" name="id" value={readme!.id} />
          ) : (
            <input type="hidden" name="projectId" value={projectId} />
          )}
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">File name</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={readme?.title ?? ""}
                placeholder="README.md"
                className="h-10 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                name="content"
                rows={8}
                defaultValue={readme?.content ?? ""}
                placeholder="# Project"
                className={cn(textareaClass, "font-mono")}
              />
            </div>
            <ComponentField defaultValue={readme?.component} />
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
