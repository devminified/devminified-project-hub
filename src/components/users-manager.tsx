"use client"

import { useActionState, useEffect, useMemo, useState, useTransition } from "react"
import {
  Check,
  Clock,
  FolderKanban,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  UserPen,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  approveUser,
  createUser,
  deleteUser,
  rejectUser,
  setUserProjects,
  updateUser,
  type UserActionState,
} from "@/app/(app)/users/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/animate-ui/components/radix/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useConfirm } from "@/hooks/use-confirm"

export type UserRow = {
  id: string
  email: string
  name: string | null
  role: "ADMIN" | "USER"
  status: "PENDING" | "APPROVED"
  createdAt: string
  projectIds: string[]
}

export type ProjectOption = { id: string; name: string }

const actionItemClass =
  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-none"

export function UsersManager({
  users,
  currentUserId,
  allProjects,
}: {
  users: UserRow[]
  currentUserId: string
  allProjects: ProjectOption[]
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<UserRow | null>(null)
  const [accessUser, setAccessUser] = useState<UserRow | null>(null)
  const [isDeleting, startDelete] = useTransition()
  const [isReviewing, startReview] = useTransition()
  const { confirm, dialog: confirmDialog } = useConfirm()

  const pending = users.filter((u) => u.status === "PENDING")
  const approved = users.filter((u) => u.status === "APPROVED")

  function handleApprove(user: UserRow) {
    startReview(async () => {
      await approveUser(user.id)
    })
  }

  async function handleReject(user: UserRow) {
    const ok = await confirm({
      title: "Reject request?",
      description: `Reject ${user.email}? Their signup request will be removed.`,
      confirmLabel: "Reject",
      destructive: true,
    })
    if (!ok) return
    startReview(async () => {
      await rejectUser(user.id)
    })
  }

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(user: UserRow) {
    setEditing(user)
    setDialogOpen(true)
  }

  async function handleDelete(user: UserRow) {
    const ok = await confirm({
      title: "Delete user?",
      description: `Delete ${user.email}? This cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    })
    if (!ok) return
    startDelete(async () => {
      await deleteUser(user.id)
    })
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Team members
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {approved.length} {approved.length === 1 ? "user" : "users"} can sign
            in to this platform.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="h-11 gap-2 rounded-xl bg-[var(--brand-cyan)] px-6 text-base font-semibold text-white shadow-sm shadow-cyan-500/20 transition-colors hover:bg-[var(--brand-cyan)]/90"
        >
          <Plus className="size-5" />
          Add user
        </Button>
      </div>

      {pending.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-xl border border-amber-200 bg-amber-50/40">
          <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-3">
            <Clock className="size-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-900">
              Pending requests
            </h3>
            <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-800">
              {pending.length}
            </span>
          </div>
          <ul className="divide-y divide-amber-100">
            {pending.map((user) => (
              <li
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {user.name || "—"}
                  </p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="hidden text-xs text-slate-400 sm:inline">
                    Requested {user.createdAt}
                  </span>
                  <Button
                    size="sm"
                    disabled={isReviewing}
                    onClick={() => handleApprove(user)}
                    className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Check className="size-3.5" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isReviewing}
                    onClick={() => handleReject(user)}
                    className="gap-1.5 text-red-600 hover:border-red-300 hover:text-red-700"
                  >
                    <X className="size-3.5" />
                    Reject
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="h-11 px-5 text-xs font-bold uppercase tracking-wide text-slate-700">
                Name
              </TableHead>
              <TableHead className="h-11 px-5 text-xs font-bold uppercase tracking-wide text-slate-700">
                Email
              </TableHead>
              <TableHead className="h-11 px-5 text-xs font-bold uppercase tracking-wide text-slate-700">
                Role
              </TableHead>
              <TableHead className="h-11 px-5 text-xs font-bold uppercase tracking-wide text-slate-700">
                Added
              </TableHead>
              <TableHead className="w-12 px-5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {approved.map((user) => (
              <TableRow key={user.id} className="border-slate-100 hover:bg-slate-50/70">
                <TableCell className="px-5 py-4 font-medium text-slate-800">
                  {user.name || "—"}
                  {user.id === currentUserId && (
                    <span className="ml-2 text-xs text-slate-400">(you)</span>
                  )}
                </TableCell>
                <TableCell className="px-5 py-4 text-slate-600">
                  {user.email}
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "rounded-full",
                      user.role === "ADMIN"
                        ? "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200"
                        : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                    )}
                  >
                    {user.role === "ADMIN" ? "Admin" : "Member"}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-4 text-slate-500">
                  {user.createdAt}
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label="Actions">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-48 p-1.5">
                      <div className="grid gap-0.5">
                        <PopoverClose asChild>
                          <button
                            type="button"
                            onClick={() => openEdit(user)}
                            className={actionItemClass}
                          >
                            <UserPen className="size-4" />
                            Edit
                          </button>
                        </PopoverClose>
                        {user.role !== "ADMIN" && (
                          <PopoverClose asChild>
                            <button
                              type="button"
                              onClick={() => setAccessUser(user)}
                              className={actionItemClass}
                            >
                              <FolderKanban className="size-4" />
                              Add to project
                            </button>
                          </PopoverClose>
                        )}
                        <PopoverClose asChild>
                          <button
                            type="button"
                            disabled={user.id === currentUserId || isDeleting}
                            onClick={() => handleDelete(user)}
                            className={cn(
                              actionItemClass,
                              "text-red-600 hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-50"
                            )}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </button>
                        </PopoverClose>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UserDialog
        key={editing?.id ?? "create"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editing}
      />

      <ProjectAccessDialog
        key={accessUser?.id ?? "access"}
        user={accessUser}
        allProjects={allProjects}
        onClose={() => setAccessUser(null)}
      />

      {confirmDialog}
    </div>
  )
}

function ProjectAccessDialog({
  user,
  allProjects,
  onClose,
}: {
  user: UserRow | null
  allProjects: ProjectOption[]
  onClose: () => void
}) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [pending, startSave] = useTransition()

  useEffect(() => {
    setSelected(new Set(user?.projectIds ?? []))
    setQuery("")
    setError(null)
  }, [user])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q
      ? allProjects.filter((p) => p.name.toLowerCase().includes(q))
      : allProjects
  }, [query, allProjects])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSave() {
    if (!user) return
    startSave(async () => {
      const res = await setUserProjects(user.id, Array.from(selected))
      if (res.error) setError(res.error)
      else onClose()
    })
  }

  return (
    <Dialog open={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project access</DialogTitle>
          <DialogDescription>
            {user
              ? `Select which projects ${user.name || user.email} can see.`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects…"
              className="h-10 pl-9"
            />
          </div>

          <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-1">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">
                No projects found.
              </p>
            ) : (
              filtered.map((p) => {
                const checked = selected.has(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggle(p.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      checked ? "bg-blue-50 text-blue-800" : "hover:bg-slate-50 text-slate-700"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded border",
                        checked
                          ? "border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white"
                          : "border-slate-300"
                      )}
                    >
                      {checked && (
                        <svg viewBox="0 0 12 12" className="size-3" fill="none">
                          <path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <FolderKanban className="size-4 shrink-0 text-slate-400" />
                    <span className="truncate">{p.name}</span>
                  </button>
                )
              })
            )}
          </div>

          <p className="text-xs text-slate-500">
            {selected.size} {selected.size === 1 ? "project" : "projects"} selected
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={pending}
            className="bg-[var(--brand-cyan)] text-white"
          >
            {pending ? "Saving…" : "Save access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function UserDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserRow | null
}) {
  const isEdit = Boolean(user)
  const action = isEdit ? updateUser : createUser
  const [state, formAction, pending] = useActionState<UserActionState, FormData>(
    action,
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
            <DialogTitle>{isEdit ? "Edit user" : "Add user"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update this user's details. Leave the password blank to keep it unchanged."
                : "Create a user who can sign in to the platform."}
            </DialogDescription>
          </DialogHeader>

          {isEdit && <input type="hidden" name="id" value={user!.id} />}

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={user?.name ?? ""}
                placeholder="Jane Doe"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={user?.email ?? ""}
                placeholder="you@company.com"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">
                {isEdit ? "New password" : "Password"}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required={!isEdit}
                placeholder={isEdit ? "Leave blank to keep current" : "••••••••"}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue={user?.role ?? "USER"}>
                <SelectTrigger id="role" className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="USER">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {state.error && (
              <p className="text-sm text-red-600">{state.error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="bg-[var(--brand-cyan)] text-white"
            >
              {pending
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Create user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
