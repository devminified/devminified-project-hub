"use client"

import { useActionState, useEffect, useState, useTransition } from "react"
import {
  Check,
  ClipboardPaste,
  Copy,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  Globe,
  Info,
  KeyRound,
  Pencil,
  Plus,
  Rocket,
  ScrollText,
  Trash2,
  Upload,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type {
  DocRecord,
  EnvRecord,
  ProjectDetail,
  ReadmeRecord,
} from "@/lib/projects-db"
import {
  createDoc,
  createDocsBulk,
  createEnv,
  createEnvsBulk,
  createReadme,
  createReadmesBulk,
  deleteDoc,
  deleteEnv,
  deleteReadme,
  updateDoc,
  updateEnv,
  updateReadme,
  type ActionState,
} from "@/app/(app)/projects/actions"
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

type FolderKey = "details" | "envs" | "docs" | "readmes"

const folders: {
  key: FolderKey
  label: string
  icon: typeof KeyRound
  subtitle?: string
}[] = [
  { key: "details", label: "Details", icon: Info, subtitle: "Overview" },
  { key: "envs", label: "ENVs", icon: KeyRound },
  { key: "docs", label: "Documentation", icon: FileText },
  { key: "readmes", label: "READMEs", icon: ScrollText },
]

const textareaClass =
  "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export function ProjectWorkspace({
  project,
  isAdmin,
}: {
  project: ProjectDetail
  isAdmin: boolean
}) {
  const [active, setActive] = useState<FolderKey>("details")

  const counts: Record<"envs" | "docs" | "readmes", number> = {
    envs: project.envs.length,
    docs: project.docs.length,
    readmes: project.readmes.length,
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {folders.map((folder) => {
          const Icon = folder.icon
          const isActive = active === folder.key
          const count =
            folder.key === "details" ? null : counts[folder.key as "envs" | "docs" | "readmes"]
          return (
            <button
              key={folder.key}
              type="button"
              onClick={() => setActive(folder.key)}
              className={cn(
                "group flex items-center gap-3 rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
                isActive
                  ? "border-blue-300 bg-blue-50/70 shadow-sm shadow-blue-100"
                  : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
              )}
            >
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                )}
              >
                {isActive && folder.key !== "details" ? (
                  <FolderOpen className="size-5" />
                ) : (
                  <Icon className="size-5" />
                )}
              </div>
              <div>
                <p className={cn("text-sm font-semibold", isActive ? "text-blue-900" : "text-slate-800")}>
                  {folder.label}
                </p>
                <p className="text-xs text-slate-500">
                  {count === null
                    ? folder.subtitle
                    : `${count} ${count === 1 ? "item" : "items"}`}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        {active === "details" && <DetailsPanel project={project} />}
        {active === "envs" && <EnvsPanel project={project} isAdmin={isAdmin} />}
        {active === "docs" && <DocsPanel project={project} isAdmin={isAdmin} />}
        {active === "readmes" && <ReadmesPanel project={project} isAdmin={isAdmin} />}
      </div>
    </div>
  )
}

function DetailsPanel({ project }: { project: ProjectDetail }) {
  const hasUrls = Boolean(project.productionUrl || project.stagingUrl)
  return (
    <Panel title="Details" description="Project overview and environment URLs.">
      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Description
          </h3>
          {project.description ? (
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {project.description}
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-400">No description yet.</p>
          )}
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            URLs
          </h3>
          {hasUrls ? (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <UrlCard
                label="Production"
                url={project.productionUrl}
                icon={Rocket}
                accent="from-emerald-500 to-emerald-600"
              />
              <UrlCard
                label="Staging"
                url={project.stagingUrl}
                icon={Globe}
                accent="from-[var(--brand-blue)] to-[var(--brand-cyan)]"
              />
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-400">
              No URLs set. Use Edit to add production and staging URLs.
            </p>
          )}
        </div>
      </div>
    </Panel>
  )
}

function UrlCard({
  label,
  url,
  icon: Icon,
  accent,
}: {
  label: string
  url: string | null
  icon: typeof Globe
  accent: string
}) {
  if (!url) return null
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md"
    >
      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white", accent)}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-[var(--brand-blue)]">
          {url}
        </p>
      </div>
      <ExternalLink className="size-4 shrink-0 text-slate-300 transition-colors group-hover:text-[var(--brand-blue)]" />
    </a>
  )
}

function ensureFileName(title: string) {
  return /\.[a-z0-9]+$/i.test(title.trim()) ? title.trim() : `${title.trim() || "file"}.md`
}

function downloadText(title: string, content: string) {
  const blob = new Blob([content ?? ""], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = ensureFileName(title)
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/* ------------------------------- shells ------------------------------ */

function Panel({
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
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
      {message}
    </div>
  )
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button size="sm" onClick={onClick} className="gap-1.5 bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-cyan)] text-white">
      <Plus className="size-3.5" />
      {label}
    </Button>
  )
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
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

/* ------------------------------- ENVs -------------------------------- */

const scopeStyles: Record<string, string> = {
  Production: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Preview: "bg-amber-50 text-amber-700 ring-amber-200",
  Development: "bg-blue-50 text-blue-700 ring-blue-200",
}

const envScopeTabs = ["All", "Production", "Preview", "Development"] as const
type EnvScopeTab = (typeof envScopeTabs)[number]

const componentTabs = ["All", "FRONTEND", "BACKEND", "DB"] as const
type ComponentTab = (typeof componentTabs)[number]
const componentLabel: Record<"FRONTEND" | "BACKEND" | "DB", string> = {
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  DB: "DB",
}
const componentBadgeStyles: Record<"FRONTEND" | "BACKEND" | "DB", string> = {
  FRONTEND: "bg-violet-50 text-violet-700 ring-violet-200",
  BACKEND: "bg-orange-50 text-orange-700 ring-orange-200",
  DB: "bg-teal-50 text-teal-700 ring-teal-200",
}

function matchesComponent(itemComponent: string | null, tab: ComponentTab) {
  return tab === "All" || itemComponent === tab
}

function ComponentFilter({
  active,
  onChange,
  countFor,
}: {
  active: ComponentTab
  onChange: (tab: ComponentTab) => void
  countFor: (tab: ComponentTab) => number
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {componentTabs.map((tab) => {
        const isActive = active === tab
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {tab === "All" ? "All" : componentLabel[tab]}
            <span
              className={cn(
                "rounded-full px-1.5 text-[10px] font-semibold",
                isActive ? "bg-white/25 text-white" : "bg-white text-slate-500"
              )}
            >
              {countFor(tab)}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function ComponentBadge({ component }: { component: string | null }) {
  if (!component || !(component in componentBadgeStyles)) return null
  const key = component as "FRONTEND" | "BACKEND" | "DB"
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        componentBadgeStyles[key]
      )}
    >
      {componentLabel[key]}
    </span>
  )
}

function ComponentField({ defaultValue }: { defaultValue?: string | null }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="component">Component</Label>
      <Select name="component" defaultValue={defaultValue ?? "none"}>
        <SelectTrigger id="component" className="h-10 w-full">
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
  )
}

function EnvsPanel({ project, isAdmin }: { project: ProjectDetail; isAdmin: boolean }) {
  const [dialog, setDialog] = useState<{ open: boolean; env: EnvRecord | null }>({
    open: false,
    env: null,
  })
  const [bulkOpen, setBulkOpen] = useState(false)
  const [scope, setScope] = useState<EnvScopeTab>("All")
  const [comp, setComp] = useState<ComponentTab>("All")
  const [copied, setCopied] = useState(false)
  const [, startDelete] = useTransition()

  const filtered = project.envs.filter(
    (e) =>
      (scope === "All" || e.scope === scope) && matchesComponent(e.component, comp)
  )

  function handleCopy() {
    const text = filtered.map((e) => `${e.key}=${e.value}`).join("\n")
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const countFor = (tab: EnvScopeTab) =>
    (tab === "All" ? project.envs : project.envs.filter((e) => e.scope === tab)).filter(
      (e) => matchesComponent(e.component, comp)
    ).length

  const componentCountFor = (tab: ComponentTab) =>
    project.envs.filter(
      (e) => (scope === "All" || e.scope === scope) && matchesComponent(e.component, tab)
    ).length

  return (
    <Panel
      title="Environment Variables"
      description="Secrets and configuration scoped per environment."
      action={
        isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBulkOpen(true)}
              className="gap-1.5"
            >
              <ClipboardPaste className="size-3.5" />
              Paste .env
            </Button>
            <AddButton label="Add variable" onClick={() => setDialog({ open: true, env: null })} />
          </div>
        )
      }
    >
      {/* Scope tabs + copy */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {envScopeTabs.map((tab) => {
            const isActive = scope === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setScope(tab)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-cyan)] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {tab}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[10px] font-semibold",
                    isActive ? "bg-white/25 text-white" : "bg-white text-slate-500"
                  )}
                >
                  {countFor(tab)}
                </span>
              </button>
            )
          })}
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          disabled={filtered.length === 0}
          className={cn("gap-1.5", copied && "border-emerald-300 text-emerald-700")}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : `Copy ${scope === "All" ? "all" : scope}`}
        </Button>
      </div>

      {/* Component tabs */}
      <div className="mb-4">
        <ComponentFilter active={comp} onChange={setComp} countFor={componentCountFor} />
      </div>

      {project.envs.length === 0 ? (
        <EmptyState message="No environment variables yet." />
      ) : filtered.length === 0 ? (
        <EmptyState message={`No ${scope.toLowerCase()} variables.`} />
      ) : (
        <ul className="divide-y divide-slate-100">
          {filtered.map((env) => (
            <li key={env.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <KeyRound className="size-4 shrink-0 text-blue-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-sm font-medium text-slate-800">{env.key}</p>
                <p className="truncate font-mono text-xs text-slate-400">{env.value}</p>
              </div>
              <ComponentBadge component={env.component} />
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
                  scopeStyles[env.scope] ?? "bg-slate-50 text-slate-600 ring-slate-200"
                )}
              >
                {env.scope}
              </span>
              {isAdmin && (
                <RowActions
                  onEdit={() => setDialog({ open: true, env })}
                  onDelete={() => {
                    if (confirm(`Delete ${env.key}?`)) startDelete(() => deleteEnv(env.id).then(() => {}))
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      <EnvDialog
        key={dialog.env?.id ?? "create"}
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        env={dialog.env}
        projectId={project.id}
      />
      <BulkEnvDialog
        key={bulkOpen ? "bulk-open" : "bulk-closed"}
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        projectId={project.id}
      />
    </Panel>
  )
}

function BulkEnvDialog({
  open,
  onOpenChange,
  projectId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createEnvsBulk,
    {}
  )
  useEffect(() => {
    if (state.success) onOpenChange(false)
  }, [state.success, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Paste .env</DialogTitle>
            <DialogDescription>
              Paste a full .env block — one KEY=VALUE per line. Blank lines and
              # comments are ignored. All variables are added to the selected
              scope.
            </DialogDescription>
          </DialogHeader>
          <input type="hidden" name="projectId" value={projectId} />
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="scope">Scope</Label>
              <Select name="scope" defaultValue="Development">
                <SelectTrigger id="scope" className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Production">Production</SelectItem>
                  <SelectItem value="Preview">Preview</SelectItem>
                  <SelectItem value="Development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ComponentField />
            <div className="space-y-1.5">
              <Label htmlFor="raw">Variables</Label>
              <textarea
                id="raw"
                name="raw"
                rows={12}
                required
                placeholder={"API_BASE_URL=https://api.example.com\nSTRIPE_KEY=pk_test_123\n# comment lines are ignored"}
                className={cn(textareaClass, "font-mono")}
              />
            </div>
            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-cyan)] text-white"
            >
              {pending ? "Importing…" : "Import variables"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EnvDialog({
  open,
  onOpenChange,
  env,
  projectId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  env: EnvRecord | null
  projectId: string
}) {
  const isEdit = Boolean(env)
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    isEdit ? updateEnv : createEnv,
    {}
  )
  useEffect(() => {
    if (state.success) onOpenChange(false)
  }, [state.success, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit variable" : "Add variable"}</DialogTitle>
            <DialogDescription>Environment variable for this project.</DialogDescription>
          </DialogHeader>
          {isEdit ? (
            <input type="hidden" name="id" value={env!.id} />
          ) : (
            <input type="hidden" name="projectId" value={projectId} />
          )}
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="key">Key</Label>
              <Input id="key" name="key" required defaultValue={env?.key ?? ""} placeholder="DATABASE_URL" className="h-10 font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="value">Value</Label>
              <Input id="value" name="value" defaultValue={env?.value ?? ""} placeholder="postgres://…" className="h-10 font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scope">Scope</Label>
              <Select name="scope" defaultValue={env?.scope ?? "Development"}>
                <SelectTrigger id="scope" className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Production">Production</SelectItem>
                  <SelectItem value="Preview">Preview</SelectItem>
                  <SelectItem value="Development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ComponentField defaultValue={env?.component} />
            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending} className="bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-cyan)] text-white">
              {pending ? "Saving…" : isEdit ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------- Docs -------------------------------- */

function DocsPanel({ project, isAdmin }: { project: ProjectDetail; isAdmin: boolean }) {
  const [dialog, setDialog] = useState<{ open: boolean; doc: DocRecord | null }>({
    open: false,
    doc: null,
  })
  const [uploadOpen, setUploadOpen] = useState(false)
  const [view, setView] = useState<DocRecord | null>(null)
  const [comp, setComp] = useState<ComponentTab>("All")
  const [, startDelete] = useTransition()

  const filtered = project.docs.filter((d) => matchesComponent(d.component, comp))
  const componentCountFor = (tab: ComponentTab) =>
    project.docs.filter((d) => matchesComponent(d.component, tab)).length

  return (
    <Panel
      title="Documentation"
      description="Guides, references, and runbooks for this project."
      action={
        isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setUploadOpen(true)}
              className="gap-1.5"
            >
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

      {project.docs.length === 0 ? (
        <EmptyState message="No documentation yet." />
      ) : filtered.length === 0 ? (
        <EmptyState message={`No ${componentLabel[comp as "FRONTEND"] ?? "matching"} docs.`} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((doc) => (
            <div key={doc.id} className="group flex items-start gap-3 rounded-lg border border-slate-200 p-4 transition-all hover:border-blue-300 hover:bg-blue-50/40">
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
                {isAdmin && (
                  <RowActions
                    onEdit={() => setDialog({ open: true, doc })}
                    onDelete={() => {
                      if (confirm(`Delete "${doc.title}"?`)) startDelete(() => deleteDoc(doc.id).then(() => {}))
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
        projectId={project.id}
      />
      <UploadDocsDialog
        key={uploadOpen ? "upload-open" : "upload-closed"}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        projectId={project.id}
      />
      <DocViewDialog doc={view} onClose={() => setView(null)} />
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
      <DialogContent className="w-[95vw] sm:max-w-4xl">
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
                className="gap-1.5 bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-cyan)] text-white"
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
    const comp = component === "none" ? null : (component as "FRONTEND" | "BACKEND" | "DB")
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
            <span className="text-sm font-medium text-slate-700">
              Click to choose files
            </span>
            <span className="text-xs text-slate-400">
              Markdown / text files work best
            </span>
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
            className="bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-cyan)] text-white"
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
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    isEdit ? updateDoc : createDoc,
    {}
  )
  useEffect(() => {
    if (state.success) onOpenChange(false)
  }, [state.success, onOpenChange])

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
              <Input id="title" name="title" required defaultValue={doc?.title ?? ""} placeholder="Architecture Overview" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <textarea id="description" name="description" rows={3} defaultValue={doc?.description ?? ""} placeholder="What does this document cover?" className={textareaClass} />
            </div>
            <ComponentField defaultValue={doc?.component} />
            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending} className="bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-cyan)] text-white">
              {pending ? "Saving…" : isEdit ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------ READMEs ------------------------------ */

function ReadmesPanel({ project, isAdmin }: { project: ProjectDetail; isAdmin: boolean }) {
  const [dialog, setDialog] = useState<{ open: boolean; readme: ReadmeRecord | null }>({
    open: false,
    readme: null,
  })
  const [uploadOpen, setUploadOpen] = useState(false)
  const [comp, setComp] = useState<ComponentTab>("All")
  const [, startDelete] = useTransition()

  const filtered = project.readmes.filter((r) => matchesComponent(r.component, comp))
  const componentCountFor = (tab: ComponentTab) =>
    project.readmes.filter((r) => matchesComponent(r.component, tab)).length

  return (
    <Panel
      title="READMEs"
      description="Markdown files that describe and onboard this project."
      action={
        isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setUploadOpen(true)}
              className="gap-1.5"
            >
              <Upload className="size-3.5" />
              Upload files
            </Button>
            <AddButton label="Add readme" onClick={() => setDialog({ open: true, readme: null })} />
          </div>
        )
      }
    >
      <div className="mb-4">
        <ComponentFilter active={comp} onChange={setComp} countFor={componentCountFor} />
      </div>

      {project.readmes.length === 0 ? (
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
                  <span className="font-mono text-xs font-medium text-slate-700">{readme.title}</span>
                  <ComponentBadge component={readme.component} />
                </div>
                {isAdmin && (
                  <RowActions
                    onEdit={() => setDialog({ open: true, readme })}
                    onDelete={() => {
                      if (confirm(`Delete "${readme.title}"?`)) startDelete(() => deleteReadme(readme.id).then(() => {}))
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
        projectId={project.id}
      />
      <UploadReadmesDialog
        key={uploadOpen ? "upload-open" : "upload-closed"}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        projectId={project.id}
      />
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
    const comp = component === "none" ? null : (component as "FRONTEND" | "BACKEND" | "DB")
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
            <span className="text-sm font-medium text-slate-700">
              Click to choose files
            </span>
            <span className="text-xs text-slate-400">
              Markdown / text files work best
            </span>
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
            className="bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-cyan)] text-white"
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
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    isEdit ? updateReadme : createReadme,
    {}
  )
  useEffect(() => {
    if (state.success) onOpenChange(false)
  }, [state.success, onOpenChange])

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
              <Input id="title" name="title" required defaultValue={readme?.title ?? ""} placeholder="README.md" className="h-10 font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="content">Content</Label>
              <textarea id="content" name="content" rows={8} defaultValue={readme?.content ?? ""} placeholder="# Project" className={cn(textareaClass, "font-mono")} />
            </div>
            <ComponentField defaultValue={readme?.component} />
            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending} className="bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-cyan)] text-white">
              {pending ? "Saving…" : isEdit ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
