"use client"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const componentTabs = ["All", "FRONTEND", "BACKEND", "DB"] as const
export type ComponentTab = (typeof componentTabs)[number]

export const componentLabel: Record<"FRONTEND" | "BACKEND" | "DB", string> = {
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  DB: "DB",
}

const componentBadgeStyles: Record<"FRONTEND" | "BACKEND" | "DB", string> = {
  FRONTEND: "bg-violet-50 text-violet-700 ring-violet-200",
  BACKEND: "bg-orange-50 text-orange-700 ring-orange-200",
  DB: "bg-teal-50 text-teal-700 ring-teal-200",
}

export function matchesComponent(itemComponent: string | null, tab: ComponentTab) {
  return tab === "All" || itemComponent === tab
}

export function ComponentFilter({
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

export function ComponentBadge({ component }: { component: string | null }) {
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

/** A <Select> bound to a form field named `component`. */
export function ComponentField({ defaultValue }: { defaultValue?: string | null }) {
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
