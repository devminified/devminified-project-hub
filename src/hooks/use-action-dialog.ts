"use client"

import { useActionState, useEffect } from "react"

import type { ActionState } from "@/app/(app)/projects/actions"

type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>

/**
 * Wraps a form server action with `useActionState` and runs `onSuccess` once the
 * action reports success — the close-on-success pattern shared by every
 * create/edit dialog.
 */
export function useActionDialog(action: FormAction, onSuccess: () => void) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    {}
  )

  useEffect(() => {
    if (state.success) onSuccess()
  }, [state.success, onSuccess])

  return { state, formAction, pending }
}
