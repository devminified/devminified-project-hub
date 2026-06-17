"use client"

import { useActionState, useEffect, useState, useTransition } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"

import {
  createProject,
  deleteProject,
  updateProject,
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

export type ProjectInput = {
  id: string
  name: string
  description: string
  status: "Production" | "Staging" | "Development"
  tags: string[]
  productionUrl: string | null
  stagingUrl: string | null
}

const textareaClass =
  "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

function ProjectDialog({
  open,
  onOpenChange,
  project,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: ProjectInput | null
}) {
  const isEdit = Boolean(project)
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    isEdit ? updateProject : createProject,
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
            <DialogTitle>{isEdit ? "Edit project" : "New project"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update this project's details."
                : "Create a new project. You can add environments, docs, and readmes afterwards."}
            </DialogDescription>
          </DialogHeader>

          {isEdit && <input type="hidden" name="id" value={project!.id} />}

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={project?.name ?? ""}
                placeholder="OnlineCook"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={project?.description ?? ""}
                placeholder="What is this project about?"
                className={textareaClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={project?.status ?? "Development"}>
                  <SelectTrigger id="status" className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Production">Production</SelectItem>
                    <SelectItem value="Staging">Staging</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  name="tags"
                  defaultValue={project?.tags.join(", ") ?? ""}
                  placeholder="Next.js, TypeScript"
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="productionUrl">Production URL</Label>
                <Input
                  id="productionUrl"
                  name="productionUrl"
                  type="url"
                  defaultValue={project?.productionUrl ?? ""}
                  placeholder="https://onlinecook.com"
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stagingUrl">Staging URL</Label>
                <Input
                  id="stagingUrl"
                  name="stagingUrl"
                  type="url"
                  defaultValue={project?.stagingUrl ?? ""}
                  placeholder="https://staging.onlinecook.com"
                  className="h-10"
                />
              </div>
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
              {pending ? "Saving…" : isEdit ? "Save changes" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ProjectCreateButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="gap-1.5 bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-cyan)] text-white"
      >
        <Plus className="size-4" />
        New project
      </Button>
      <ProjectDialog key={open ? "open" : "closed"} open={open} onOpenChange={setOpen} project={null} />
    </>
  )
}

export function ProjectActions({ project }: { project: ProjectInput }) {
  const [open, setOpen] = useState(false)
  const [isDeleting, startDelete] = useTransition()

  function handleDelete() {
    if (!confirm(`Delete ${project.name}? This removes all its data.`)) return
    startDelete(async () => {
      await deleteProject(project.id)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Pencil className="size-3.5" />
        Edit
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={isDeleting}
        onClick={handleDelete}
        className="gap-1.5 text-red-600 hover:border-red-300 hover:text-red-700"
      >
        <Trash2 className="size-3.5" />
        Delete
      </Button>
      <ProjectDialog
        key={open ? "open" : "closed"}
        open={open}
        onOpenChange={setOpen}
        project={project}
      />
    </div>
  )
}
