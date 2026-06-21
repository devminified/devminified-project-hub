"use client"

import { useEffect, useRef } from "react"
import type { AnimationItem } from "lottie-web"

import { cn } from "@/lib/utils"

/**
 * Lightweight wrapper around lottie-web. Pass an imported Lottie JSON as
 * `animationData`. lottie-web is loaded lazily inside the effect so it never
 * runs during SSR and stays out of the server bundle.
 */
export function LottiePlayer({
  animationData,
  loop = true,
  autoplay = true,
  className,
}: {
  animationData: unknown
  loop?: boolean
  autoplay?: boolean
  className?: string
}) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let anim: AnimationItem | undefined
    let cancelled = false

    import("lottie-web").then(({ default: lottie }) => {
      if (cancelled || !container.current) return
      anim = lottie.loadAnimation({
        container: container.current,
        renderer: "svg",
        loop,
        autoplay,
        animationData,
      })
    })

    return () => {
      cancelled = true
      anim?.destroy()
    }
  }, [animationData, loop, autoplay])

  return <div ref={container} className={cn("h-full w-full", className)} aria-hidden />
}
