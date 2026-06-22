"use client"

import { useState, useTransition } from "react"
import { Check, ClipboardPaste, Copy, KeyRound } from "lucide-react"

import { cn } from "@/lib/utils"
import type { EnvRecord } from "@/lib/projects/types"
import {
  createEnv,
  createEnvsBulk,
  deleteEnv,
  updateEnv,
} from "@/app/(app)/projects/actions"
import { useActionDialog } from "@/hooks/use-action-dialog"
import { useClipboard } from "@/hooks/use-clipboard"
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
import { scopeStyles, textareaClass } from "./utils"

const envScopeTabs = ["All", "Production", "Preview", "Development"] as const
type EnvScopeTab = (typeof envScopeTabs)[number]

export function EnvsPanel({
  envs,
  projectId,
  isAdmin,
}: {
  envs: EnvRecord[]
  projectId: string
  isAdmin: boolean
}) {
  const [dialog, setDialog] = useState<{ open: boolean; env: EnvRecord | null }>({
    open: false,
    env: null,
  })
  const bulk = useDisclosure()
  const [scope, setScope] = useState<EnvScopeTab>("All")
  const [comp, setComp] = useState<ComponentTab>("All")
  const { copied, copy } = useClipboard()
  const { confirm, dialog: confirmDialog } = useConfirm()
  const [, startDelete] = useTransition()

  const filtered = envs.filter(
    (e) =>
      (scope === "All" || e.scope === scope) && matchesComponent(e.component, comp)
  )

  const countFor = (tab: EnvScopeTab) =>
    (tab === "All" ? envs : envs.filter((e) => e.scope === tab)).filter((e) =>
      matchesComponent(e.component, comp)
    ).length

  const componentCountFor = (tab: ComponentTab) =>
    envs.filter(
      (e) => (scope === "All" || e.scope === scope) && matchesComponent(e.component, tab)
    ).length

  return (
    <Panel
      title="Environment Variables"
      description="Secrets and configuration scoped per environment."
      action={
        isAdmin && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={bulk.onOpen} className="gap-1.5">
              <ClipboardPaste className="size-3.5" />
              Paste .env
            </Button>
            <AddButton
              label="Add variable"
              onClick={() => setDialog({ open: true, env: null })}
            />
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
                    ? "bg-[var(--brand-primary)] text-white shadow-sm"
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
          onClick={() => copy(filtered.map((e) => `${e.key}=${e.value}`).join("\n"))}
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

      {envs.length === 0 ? (
        <EmptyState message="No environment variables yet." />
      ) : filtered.length === 0 ? (
        <EmptyState message={`No ${scope.toLowerCase()} variables.`} />
      ) : (
        <ul className="divide-y divide-slate-100">
          {filtered.map((env) => (
            <li key={env.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <KeyRound className="size-4 shrink-0 text-blue-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-sm font-medium text-slate-800">
                  {env.key}
                </p>
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
                  onDelete={async () => {
                    const ok = await confirm({
                      title: "Delete variable?",
                      description: `Delete ${env.key}? This can't be undone.`,
                      confirmLabel: "Delete",
                      destructive: true,
                    })
                    if (ok) startDelete(() => deleteEnv(env.id).then(() => {}))
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
        projectId={projectId}
      />
      <BulkEnvDialog
        key={bulk.open ? "bulk-open" : "bulk-closed"}
        open={bulk.open}
        onOpenChange={bulk.setOpen}
        projectId={projectId}
      />
      {confirmDialog}
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
  const { state, formAction, pending } = useActionDialog(createEnvsBulk, () =>
    onOpenChange(false)
  )

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
              className="bg-[var(--brand-primary)] text-white"
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
  const { state, formAction, pending } = useActionDialog(
    isEdit ? updateEnv : createEnv,
    () => onOpenChange(false)
  )

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
              <Input
                id="key"
                name="key"
                required
                defaultValue={env?.key ?? ""}
                placeholder="DATABASE_URL"
                className="h-10 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                name="value"
                defaultValue={env?.value ?? ""}
                placeholder="postgres://…"
                className="h-10 font-mono"
              />
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
