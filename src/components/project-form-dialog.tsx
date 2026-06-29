"use client"

import { useActionState, useEffect, useState, useTransition } from "react"
import { ImagePlus, Loader2, Pencil, Plus, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  createProject,
  deleteProject,
  updateProject,
  uploadProjectImage,
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
import { useConfirm } from "@/hooks/use-confirm"

export type ProjectInput = {
  id: string
  name: string
  description: string
  status: "Production" | "Staging" | "Development"
  tags: string[]
  imageUrl: string | null
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
  const [image, setImage] = useState<string | null>(project?.imageUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    isEdit ? updateProject : createProject,
    {}
  )

  useEffect(() => {
    if (state.success) onOpenChange(false)
  }, [state.success, onOpenChange])

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageError(null)
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    const res = await uploadProjectImage(formData)
    setUploading(false)
    e.target.value = "" // allow re-selecting the same file
    if (res.error) {
      setImageError(res.error)
      return
    }
    if (res.url) setImage(res.url)
  }

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
          <input type="hidden" name="imageUrl" value={image ?? ""} />

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>Image</Label>
              <div className="flex items-center gap-3">
                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  {uploading ? (
                    <Loader2 className="size-5 animate-spin text-slate-400" />
                  ) : image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt="" className="size-full object-cover" />
                  ) : (
                    <ImagePlus className="size-5 text-slate-400" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label
                    className={cn(
                      "cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50",
                      uploading && "pointer-events-none opacity-60"
                    )}
                  >
                    {uploading ? "Uploading…" : image ? "Change image" : "Add image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={handleImage}
                    />
                  </label>
                  {image && !uploading && (
                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 hover:border-red-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              {imageError && <p className="text-sm text-red-600">{imageError}</p>}
            </div>

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
                rows={6}
                defaultValue={project?.description ?? ""}
                placeholder="What is this project about?"
                className={cn(textareaClass, "min-h-32")}
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

            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending || uploading}
              className="bg-[var(--brand-primary)] text-white"
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
        className="h-11 gap-2 rounded-xl bg-[var(--brand-primary)] px-6 text-base font-semibold text-white shadow-sm shadow-indigo-500/20 transition-colors hover:bg-[var(--brand-primary)]/90"
      >
        <Plus className="size-5" />
        New project
      </Button>
      <ProjectDialog key={open ? "open" : "closed"} open={open} onOpenChange={setOpen} project={null} />
    </>
  )
}

export function ProjectActions({ project }: { project: ProjectInput }) {
  const [open, setOpen] = useState(false)
  const [isDeleting, startDelete] = useTransition()
  const { confirm, dialog: confirmDialog } = useConfirm()

  async function handleDelete() {
    const ok = await confirm({
      title: "Delete project?",
      description: `Delete ${project.name}? This removes all its data.`,
      confirmLabel: "Delete",
      destructive: true,
    })
    if (!ok) return
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
      {confirmDialog}
    </div>
  )
}
