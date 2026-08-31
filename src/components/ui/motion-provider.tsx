"use client"

import { MotionConfig } from "motion/react"

/**
 * Applies `prefers-reduced-motion` to every JS-driven animation in the tree
 * (the sidebar highlight, tab indicator, toasts). CSS animations are handled
 * by the media query in globals.css.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.18 }}>
      {children}
    </MotionConfig>
  )
}
