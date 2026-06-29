"use client"

import { useEffect, useState, useTransition } from "react"
import { Check, Loader2, UsersRound } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  listProjectDevs,
  setProjectDev,
  type DevCandidate,
} from "@/app/(app)/projects/actions"
import { useDisclosure } from "@/hooks/use-disclosure"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/** Admin-only entry point: opens the Manage devs dialog for a project. */
export function ManageDevsButton({ projectId }: { projectId: string }) {
  const dialog = useDisclosure()
  return (
    <>
      <Button variant="outline" size="sm" onClick={dialog.onOpen} className="gap-1.5">
        <UsersRound className="size-3.5" />
        Manage devs
      </Button>
      <ManageDevsDialog
        key={dialog.open ? "open" : "closed"}
        open={dialog.open}
        onOpenChange={dialog.setOpen}
        projectId={projectId}
      />
    </>
  )
}

function ManageDevsDialog({
  open,
  onOpenChange,
  projectId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
}) {
  const [candidates, setCandidates] = useState<DevCandidate[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, startLoad] = useTransition()
  // Track which user rows have a grant/revoke in flight.
  const [busy, setBusy] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!open) return
    startLoad(async () => {
      setCandidates(await listProjectDevs(projectId))
    })
  }, [open, projectId])

  function toggle(user: DevCandidate) {
    const makeDev = !user.isDev
    setBusy((b) => ({ ...b, [user.id]: true }))
    setError(null)
    startLoad(async () => {
      const res = await setProjectDev(projectId, user.id, makeDev)
      if (res.error) {
        setError(res.error)
      } else {
        setCandidates((prev) =>
          prev
            ? prev.map((c) => (c.id === user.id ? { ...c, isDev: makeDev } : c))
            : prev
        )
      }
      setBusy((b) => ({ ...b, [user.id]: false }))
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage devs</DialogTitle>
          <DialogDescription>
            Grant a member the dev role for this project so they can edit its
            details, ENVs, docs, and READMEs — but not secrets or project
            settings. Only this project&apos;s members are listed, and the role
            applies to this project only.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[55vh] space-y-1.5 overflow-y-auto py-2">
          {candidates === null && loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
              <Loader2 className="size-4 animate-spin" />
              Loading users…
            </div>
          ) : candidates && candidates.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              No project members yet. Add members to this project on the Users
              screen first, then grant them dev access here.
            </p>
          ) : (
            candidates?.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => toggle(user)}
                disabled={busy[user.id]}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors disabled:opacity-60",
                  user.isDev
                    ? "border-emerald-200 bg-emerald-50/60"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {user.name || user.email}
                  </p>
                  {user.name && (
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  )}
                </div>
                {busy[user.id] ? (
                  <Loader2 className="size-4 shrink-0 animate-spin text-slate-400" />
                ) : (
                  <span
                    className={cn(
                      "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                      user.isDev
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {user.isDev && <Check className="size-3" />}
                    {user.isDev ? "Dev" : "Make dev"}
                  </span>
                )}
              </button>
            ))
          )}

          {error && <p className="px-1 text-sm text-red-600">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
