"use client"

import { useState, useTransition } from "react"
import { Code2, Download, Eye, FileText, Upload } from "lucide-react"

import type { DocRecord, ProjectTab } from "@/lib/projects/types"
import { Markdown } from "@/components/ui/markdown"
import { FileOpenButton, FilePreview, fileLinks } from "./file-preview"
import { fileKind, isMarkdownFile } from "./utils"
import {
  PreparedFileList,
  prepareFile,
  uploadPreparedFiles,
  type PreparedFile,
} from "./upload-files"
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
  ALL_TAB,
  matchesTab,
  TabBadge,
  TabField,
  TabFilter,
  tabLookup,
} from "./tab-filter"
import { downloadText, textareaClass } from "./utils"

export function DocsPanel({
  docs,
  tabs,
  projectId,
  canEdit,
}: {
  docs: DocRecord[]
  tabs: ProjectTab[]
  projectId: string
  canEdit: boolean
}) {
  const [dialog, setDialog] = useState<{ open: boolean; doc: DocRecord | null }>({
    open: false,
    doc: null,
  })
  const upload = useDisclosure()
  const [view, setView] = useState<DocRecord | null>(null)
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB)
  const { confirm, dialog: confirmDialog } = useConfirm()
  const [, startDelete] = useTransition()

  const byId = tabLookup(tabs)
  const filtered = docs.filter((d) => matchesTab(d.tabId, activeTab))
  const tabCountFor = (id: string) =>
    docs.filter((d) => matchesTab(d.tabId, id)).length

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
        <TabFilter
          tabs={tabs}
          activeId={activeTab}
          onChange={setActiveTab}
          countFor={tabCountFor}
          canEdit={canEdit}
          projectId={projectId}
          feature="DOC"
        />
      </div>

      {docs.length === 0 ? (
        <EmptyState message="No documentation yet." />
      ) : filtered.length === 0 ? (
        <EmptyState message="No matching docs." />
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
                    <TabBadge tab={doc.tabId ? byId.get(doc.tabId) : undefined} />
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                  {doc.fileUrl
                    ? fileKind(doc.title, doc.fileType) === "pdf"
                      ? "PDF document"
                      : "Word document"
                    : doc.description}
                </p>
                  <p className="mt-2 text-xs text-slate-400">Updated {doc.updatedAt}</p>
                </div>
              </button>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    doc.fileUrl
                      ? window.open(
                          fileLinks("doc", doc.id, doc.fileUrl, doc.fileType, doc.title).open,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      : downloadText(doc.title, doc.description)
                  }
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
        tabs={tabs}
        projectId={projectId}
      />
      <UploadDocsDialog
        key={upload.open ? "upload-open" : "upload-closed"}
        open={upload.open}
        onOpenChange={upload.setOpen}
        tabs={tabs}
        projectId={projectId}
      />
      <DocViewDialog
        doc={view}
        tab={view?.tabId ? byId.get(view.tabId) : undefined}
        onClose={() => setView(null)}
      />
      {confirmDialog}
    </Panel>
  )
}

function DocViewDialog({
  doc,
  tab,
  onClose,
}: {
  doc: DocRecord | null
  tab: ProjectTab | undefined
  onClose: () => void
}) {
  return (
    <Dialog open={Boolean(doc)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[95vh] w-[96vw] max-w-[96vw] flex-col">
        {doc && <DocViewContent key={doc.id} doc={doc} tab={tab} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  )
}

function DocViewContent({
  doc,
  tab,
  onClose,
}: {
  doc: DocRecord
  tab: ProjectTab | undefined
  onClose: () => void
}) {
  const isFile = Boolean(doc.fileUrl)
  const isMarkdown = !isFile && isMarkdownFile(doc.title)
  const [raw, setRaw] = useState(false)

  return (
    <>
      <DialogHeader className="shrink-0">
        <DialogTitle className="flex items-center gap-2 text-lg">
          <FileText className="size-5 text-blue-500" />
          {doc.title}
          <TabBadge tab={tab} />
          {isMarkdown && doc.description && (
            <button
              type="button"
              onClick={() => setRaw((v) => !v)}
              className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label={raw ? "Show preview" : "Show raw markdown"}
            >
              {raw ? (
                <>
                  <Eye className="size-3.5" />
                  Preview
                </>
              ) : (
                <>
                  <Code2 className="size-3.5" />
                  Raw
                </>
              )}
            </button>
          )}
        </DialogTitle>
        <DialogDescription>Updated {doc.updatedAt}</DialogDescription>
      </DialogHeader>

      <div className="min-h-0 flex-1 py-2">
        {isFile ? (
          <FilePreview
            kind="doc"
            id={doc.id}
            fileUrl={doc.fileUrl!}
            fileType={doc.fileType}
            title={doc.title}
            className="h-full"
          />
        ) : doc.description ? (
          isMarkdown && !raw ? (
            <div className="h-full overflow-auto rounded-lg bg-slate-50 px-6 py-5">
              <div className="mx-auto max-w-4xl">
                <Markdown>{doc.description}</Markdown>
              </div>
            </div>
          ) : (
            <pre className="h-full overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-5 font-mono text-sm leading-relaxed text-slate-700">
              {doc.description}
            </pre>
          )
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="rounded-lg border border-dashed border-slate-200 px-8 py-10 text-center text-sm text-slate-400">
              This document has no content. Edit it to add details.
            </p>
          </div>
        )}
      </div>

      <DialogFooter className="shrink-0">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        {isFile ? (
          <FileOpenButton
            href={fileLinks("doc", doc.id, doc.fileUrl!, doc.fileType, doc.title).open}
            label="Download"
          />
        ) : (
          <Button
            onClick={() => downloadText(doc.title, doc.description)}
            className="gap-1.5 bg-[var(--brand-primary)] text-white"
          >
            <Download className="size-4" />
            Download
          </Button>
        )}
      </DialogFooter>
    </>
  )
}

function UploadDocsDialog({
  open,
  onOpenChange,
  tabs,
  projectId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tabs: ProjectTab[]
  projectId: string
}) {
  const [files, setFiles] = useState<PreparedFile[]>([])
  const [tabId, setTabId] = useState<string>("none")
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
      const read = await Promise.all(Array.from(list).map(prepareFile))
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
    const tab = tabId === "none" ? null : tabId
    startUpload(async () => {
      const payload = await uploadPreparedFiles(files, projectId)
      if (payload.error) {
        setError(payload.error)
        return
      }
      const res = await createDocsBulk(projectId, payload.entries, tab)
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
            <Label>Tab</Label>
            <Select value={tabId} onValueChange={(v) => setTabId(v ?? "none")}>
              <SelectTrigger className="h-10 w-full">
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

          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/40">
            <Upload className="size-6 text-blue-500" />
            <span className="text-sm font-medium text-slate-700">Click to choose files</span>
            <span className="text-xs text-slate-400">
              Markdown / text, or PDF &amp; Word documents
            </span>
            <input
              type="file"
              multiple
              accept=".md,.markdown,.txt,.json,.yml,.yaml,.pdf,.doc,.docx,text/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={handleFiles}
            />
          </label>

          {reading && <p className="text-sm text-slate-500">Reading files…</p>}

          {files.length > 0 && <PreparedFileList files={files} />}

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
  tabs,
  projectId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  doc: DocRecord | null
  tabs: ProjectTab[]
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
            <TabField tabs={tabs} defaultValue={doc?.tabId} />
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
