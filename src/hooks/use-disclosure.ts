"use client"

import { useCallback, useState } from "react"

/** Minimal open/close state for dialogs, sheets, and popovers. */
export function useDisclosure(initial = false) {
  const [open, setOpen] = useState(initial)
  const onOpen = useCallback(() => setOpen(true), [])
  const onClose = useCallback(() => setOpen(false), [])
  return { open, setOpen, onOpen, onClose }
}
