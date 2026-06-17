"use client"

import { useActionState, useEffect, useMemo, useState, useTransition } from "react"
import { FolderKanban, MoreHorizontal, Plus, Search, Trash2, UserPen } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  createUser,
  deleteUser,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

export type UserRow = {
  id: string
  email: string
  name: string | null
  role: "ADMIN" | "USER"
  createdAt: string
  projectIds: string[]
}

export type ProjectOption = { id: string; name: string }

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

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(user: UserRow) {
    setEditing(user)
    setDialogOpen(true)
  }

  function handleDelete(user: UserRow) {
    if (!confirm(`Delete ${user.email}? This cannot be undone.`)) return
    startDelete(async () => {
      await deleteUser(user.id)
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Team members
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {users.length} {users.length === 1 ? "user" : "users"} can sign in to
            this platform.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="gap-1.5 bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-cyan)] text-white"
        >
          <Plus className="size-4" />
          Add user
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium text-slate-800">
                  {user.name || "—"}
                  {user.id === currentUserId && (
                    <span className="ml-2 text-xs text-slate-400">(you)</span>
                  )}
                </TableCell>
                <TableCell className="text-slate-600">{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === "ADMIN" ? "default" : "secondary"}
                    className={
                      user.role === "ADMIN"
                        ? "bg-blue-100 text-blue-700"
                        : undefined
                    }
                  >
                    {user.role === "ADMIN" ? "Admin" : "Member"}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-500">{user.createdAt}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-sm" aria-label="Actions">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="min-w-44">
                      {/* wide enough to keep items on one line */}
                      <DropdownMenuItem onClick={() => openEdit(user)}>
                        <UserPen className="size-4" />
                        Edit
                      </DropdownMenuItem>
                      {user.role !== "ADMIN" && (
                        <DropdownMenuItem onClick={() => setAccessUser(user)}>
                          <FolderKanban className="size-4" />
                          Add to project
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        disabled={user.id === currentUserId || isDeleting}
                        onClick={() => handleDelete(user)}
                        variant="destructive"
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
            className="bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-cyan)] text-white"
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
              className="bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-cyan)] text-white"
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
