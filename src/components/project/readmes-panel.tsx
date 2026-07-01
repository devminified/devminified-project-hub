"use client"

import { useState, useTransition } from "react"
import { Code2, Eye, ScrollText, Upload } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ProjectTab, ReadmeRecord } from "@/lib/projects/types"
import { Markdown } from "@/components/ui/markdown"
import { FileOpenButton, FilePreview, fileLinks } from "./file-preview"
import {
  PreparedFileList,
  prepareFile,
  uploadPreparedFiles,
  type PreparedFile,
} from "./upload-files"
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
  ALL_TAB,
  matchesTab,
  TabBadge,
  TabField,
  TabFilter,
  tabLookup,
} from "./tab-filter"
import { textareaClass } from "./utils"

export function ReadmesPanel({
  readmes,
  tabs,
  projectId,
  canEdit,
}: {
  readmes: ReadmeRecord[]
  tabs: ProjectTab[]
  projectId: string
  canEdit: boolean
}) {
  const [dialog, setDialog] = useState<{ open: boolean; readme: ReadmeRecord | null }>({
    open: false,
    readme: null,
  })
  const upload = useDisclosure()
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB)
  const { confirm, dialog: confirmDialog } = useConfirm()
  const [, startDelete] = useTransition()

  const byId = tabLookup(tabs)
  const filtered = readmes.filter((r) => matchesTab(r.tabId, activeTab))
  const tabCountFor = (id: string) =>
    readmes.filter((r) => matchesTab(r.tabId, id)).length

  return (
    <Panel
      title="READMEs"
      description="Markdown files that describe and onboard this project."
      action={
        canEdit && (
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
        <TabFilter
          tabs={tabs}
          activeId={activeTab}
          onChange={setActiveTab}
          countFor={tabCountFor}
          canEdit={canEdit}
          projectId={projectId}
          feature="README"
        />
      </div>

      {readmes.length === 0 ? (
        <EmptyState message="No readme files yet." />
      ) : filtered.length === 0 ? (
        <EmptyState message="No matching readmes." />
      ) : (
        <div className="space-y-4">
          {filtered.map((readme) => (
            <ReadmeCard
              key={readme.id}
              readme={readme}
              tab={readme.tabId ? byId.get(readme.tabId) : undefined}
              canEdit={canEdit}
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
          ))}
        </div>
      )}

      <ReadmeDialog
        key={dialog.readme?.id ?? "create"}
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        readme={dialog.readme}
        tabs={tabs}
        projectId={projectId}
      />
      <UploadReadmesDialog
        key={upload.open ? "upload-open" : "upload-closed"}
        open={upload.open}
        onOpenChange={upload.setOpen}
        tabs={tabs}
        projectId={projectId}
      />
      {confirmDialog}
    </Panel>
  )
}

function ReadmeCard({
  readme,
  tab,
  canEdit,
  onEdit,
  onDelete,
}: {
  readme: ReadmeRecord
  tab: ProjectTab | undefined
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const [raw, setRaw] = useState(false)
  const isFile = Boolean(readme.fileUrl)

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <ScrollText className="size-4 text-blue-500" />
          <span className="font-mono text-xs font-medium text-slate-700">{readme.title}</span>
          <TabBadge tab={tab} />
        </div>
        <div className="flex items-center gap-1">
          {isFile ? (
            <FileOpenButton
              href={fileLinks("readme", readme.id, readme.fileUrl!, readme.fileType, readme.title).open}
              label="Open"
              className="h-7 px-2 py-0 text-xs"
            />
          ) : (
            <button
              type="button"
              onClick={() => setRaw((v) => !v)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
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
          {canEdit && <RowActions onEdit={onEdit} onDelete={onDelete} />}
        </div>
      </div>
      {isFile ? (
        <div className="p-4">
          <FilePreview
            kind="readme"
            id={readme.id}
            fileUrl={readme.fileUrl!}
            fileType={readme.fileType}
            title={readme.title}
            className="h-[70vh]"
          />
        </div>
      ) : raw ? (
        <pre className="overflow-x-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-slate-700">
          {readme.content}
        </pre>
      ) : readme.content.trim() ? (
        <div className="px-5 py-4">
          <Markdown>{readme.content}</Markdown>
        </div>
      ) : (
        <p className="px-5 py-8 text-center text-sm text-slate-400">
          This readme is empty. Edit it to add content.
        </p>
      )}
    </div>
  )
}

function UploadReadmesDialog({
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
      const res = await createReadmesBulk(projectId, payload.entries, tab)
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
              accept=".md,.markdown,.txt,.pdf,.doc,.docx,text/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
  tabs,
  projectId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  readme: ReadmeRecord | null
  tabs: ProjectTab[]
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
            <TabField tabs={tabs} defaultValue={readme?.tabId} />
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
