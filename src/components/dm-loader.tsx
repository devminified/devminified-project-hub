import { Loader2 } from "lucide-react"

import { TopProgressBar } from "@/components/top-progress-bar"

export function DmLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--brand-tint)]">
      <TopProgressBar />
      <Loader2 className="size-10 animate-spin text-[var(--brand-blue)]" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}
