"use client"

import { useActionState, useEffect, useRef } from "react"

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

  // Callers pass `onSuccess` as an inline closure, so it has a fresh identity on
  // every render. Keep it in a ref instead of depending on it — otherwise the
  // effect below re-runs after *every* render, not just when the action lands.
  const onSuccessRef = useRef(onSuccess)
  useEffect(() => {
    onSuccessRef.current = onSuccess
  })

  // `state.success` stays true once the action resolves, so a `[state.success]`
  // dependency would either re-fire forever or (true -> true) never fire again
  // on a second submit. Each run of the action returns a *new* state object, so
  // track which object we've already handled: fires exactly once per submission.
  const handled = useRef<ActionState | null>(null)
  useEffect(() => {
    if (state.success && handled.current !== state) {
      handled.current = state
      onSuccessRef.current()
    }
  }, [state])

  return { state, formAction, pending }
}
