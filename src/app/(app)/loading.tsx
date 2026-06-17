import { Loader2 } from "lucide-react"

import { TopProgressBar } from "@/components/top-progress-bar"

export default function Loading() {
  return (
    <>
      <TopProgressBar />
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[var(--brand-blue)]" />
      </div>
    </>
  )
}
