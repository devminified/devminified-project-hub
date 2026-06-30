"use client"

import { useState, useTransition } from "react"
import { Check, ClipboardPaste, Copy, KeyRound } from "lucide-react"

import { cn } from "@/lib/utils"
import type { EnvRecord, ProjectTab } from "@/lib/projects/types"
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

export function EnvsPanel({
  envs,
  tabs,
  scopeTabs,
  projectId,
  canEdit,
}: {
  envs: EnvRecord[]
  tabs: ProjectTab[]
  scopeTabs: ProjectTab[]
  projectId: string
  canEdit: boolean
}) {
  const [dialog, setDialog] = useState<{ open: boolean; env: EnvRecord | null }>({
    open: false,
    env: null,
  })
  const bulk = useDisclosure()
  const [activeScope, setActiveScope] = useState<string>(ALL_TAB)
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB)
  const { copied, copy } = useClipboard()
  const { confirm, dialog: confirmDialog } = useConfirm()
  const [, startDelete] = useTransition()

  const byId = tabLookup(tabs)
  const scopeById = tabLookup(scopeTabs)
  const filtered = envs.filter(
    (e) => matchesTab(e.scopeTabId, activeScope) && matchesTab(e.tabId, activeTab)
  )

  const scopeCountFor = (id: string) =>
    envs.filter(
      (e) => matchesTab(e.scopeTabId, id) && matchesTab(e.tabId, activeTab)
    ).length

  const tabCountFor = (id: string) =>
    envs.filter(
      (e) => matchesTab(e.scopeTabId, activeScope) && matchesTab(e.tabId, id)
    ).length

  const activeScopeName =
    activeScope === ALL_TAB ? "all" : scopeById.get(activeScope)?.name ?? "all"

  return (
    <Panel
      title="Environment Variables"
      description="Secrets and configuration scoped per environment."
      action={
        canEdit && (
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
        <TabFilter
          tabs={scopeTabs}
          activeId={activeScope}
          onChange={setActiveScope}
          countFor={scopeCountFor}
          canEdit={canEdit}
          projectId={projectId}
          feature="ENV_SCOPE"
          activeClassName="bg-[var(--brand-primary)] text-white shadow-sm"
        />

        <Button
          size="sm"
          variant="outline"
          onClick={() => copy(filtered.map((e) => `${e.key}=${e.value}`).join("\n"))}
          disabled={filtered.length === 0}
          className={cn("gap-1.5", copied && "border-emerald-300 text-emerald-700")}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : `Copy ${activeScopeName}`}
        </Button>
      </div>

      {/* Component tab filter */}
      <div className="mb-4">
        <TabFilter
          tabs={tabs}
          activeId={activeTab}
          onChange={setActiveTab}
          countFor={tabCountFor}
          canEdit={canEdit}
          projectId={projectId}
          feature="ENV"
        />
      </div>

      {envs.length === 0 ? (
        <EmptyState message="No environment variables yet." />
      ) : filtered.length === 0 ? (
        <EmptyState message="No matching variables." />
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
              <TabBadge tab={env.tabId ? byId.get(env.tabId) : undefined} />
              <TabBadge tab={env.scopeTabId ? scopeById.get(env.scopeTabId) : undefined} />
              {canEdit && (
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
        tabs={tabs}
        scopeTabs={scopeTabs}
        projectId={projectId}
      />
      <BulkEnvDialog
        key={bulk.open ? "bulk-open" : "bulk-closed"}
        open={bulk.open}
        onOpenChange={bulk.setOpen}
        tabs={tabs}
        scopeTabs={scopeTabs}
        projectId={projectId}
      />
      {confirmDialog}
    </Panel>
  )
}

function BulkEnvDialog({
  open,
  onOpenChange,
  tabs,
  scopeTabs,
  projectId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tabs: ProjectTab[]
  scopeTabs: ProjectTab[]
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
            <TabField tabs={scopeTabs} name="scopeTabId" label="Scope" />
            <TabField tabs={tabs} />
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
  tabs,
  scopeTabs,
  projectId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  env: EnvRecord | null
  tabs: ProjectTab[]
  scopeTabs: ProjectTab[]
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
            <TabField
              tabs={scopeTabs}
              name="scopeTabId"
              label="Scope"
              defaultValue={env?.scopeTabId}
            />
            <TabField tabs={tabs} defaultValue={env?.tabId} />
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
