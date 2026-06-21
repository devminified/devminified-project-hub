"use client"

import { useActionState } from "react"
import Link from "next/link"
import { AlertCircle, CheckCircle2, Lock, Mail, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signup, type SignupState } from "@/app/signup/actions"

export function SignupForm() {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(
    signup,
    {}
  )

  if (state.success) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
          <CheckCircle2 className="size-7" />
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">
          Request sent
        </h1>
        <p className="mt-3 text-slate-500">
          Your account is awaiting admin approval. You&apos;ll be able to sign in
          once an admin accepts your request.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[var(--brand-cyan)] text-base font-semibold text-white transition-opacity hover:opacity-90"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-10">
        <h1 className="text-5xl font-semibold tracking-tight text-slate-900">
          Create account
        </h1>
        <p className="mt-3 text-lg text-slate-500">
          Request access to the Project Hub.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <Field label="Full name">
          <FieldIcon>
            <User className="size-5" />
          </FieldIcon>
          <Input
            type="text"
            name="name"
            placeholder="Jane Doe"
            className="h-13 rounded-xl pl-11 text-base"
          />
        </Field>

        <Field label="Email">
          <FieldIcon>
            <Mail className="size-5" />
          </FieldIcon>
          <Input
            type="email"
            name="email"
            required
            placeholder="you@company.com"
            className="h-13 rounded-xl pl-11 text-base"
          />
        </Field>

        <Field label="Password">
          <FieldIcon>
            <Lock className="size-5" />
          </FieldIcon>
          <Input
            type="password"
            name="password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            className="h-13 rounded-xl pl-11 text-base"
          />
        </Field>

        {state.error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="size-4 shrink-0" />
            {state.error}
          </div>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="h-13 w-full rounded-xl bg-[var(--brand-cyan)] text-base font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:opacity-95 hover:shadow-xl hover:shadow-cyan-500/30 disabled:opacity-70"
        >
          {pending ? "Creating…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[var(--brand-cyan)] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">{children}</div>
    </div>
  )
}

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
      {children}
    </span>
  )
}
