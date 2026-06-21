"use client"

import { cn } from "@/lib/utils"
import emptyAnimation from "@/assets/shopcash-empty.json"
import { LottiePlayer } from "@/components/lottie-player"

/**
 * "No results" state with the ShopCash empty Lottie animation, a title, and an
 * optional supporting line + action. Use wherever a list or search comes back
 * empty.
 */
export function EmptyResult({
  title,
  description,
  action,
  size = "md",
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  size?: "sm" | "md"
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/40 px-6 py-10 text-center",
        className
      )}
    >
      <LottiePlayer
        animationData={emptyAnimation}
        className={size === "sm" ? "h-32 w-32" : "h-44 w-44"}
      />
      <p className="mt-2 text-sm font-semibold text-slate-700">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-400">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
