"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Copy text to the clipboard and expose a transient `copied` flag that resets
 * after `timeout` ms — for "Copy" → "Copied" button feedback.
 */
export function useClipboard(timeout = 1500) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), timeout)
      } catch {
        setCopied(false)
      }
    },
    [timeout]
  )

  return { copied, copy }
}
