"use client"

import { useActionState, useState } from "react"
import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login, type LoginState } from "@/app/login/actions"

export function AuthForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    {}
  )

  return (
    <div className="w-full max-w-md">
      <div className="mb-10">
        <h1 className="text-5xl font-semibold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mt-3 text-lg text-slate-500">
          Sign in to access your Project Hub.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
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
            type={showPassword ? "text" : "password"}
            name="password"
            required
            placeholder="••••••••"
            className="h-13 rounded-xl pl-11 pr-11 text-base"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        </Field>

        <label className="flex items-center gap-2.5 text-sm text-slate-500">
          <input
            type="checkbox"
            name="remember"
            className="size-4 rounded border-slate-300 text-[var(--brand-blue)] accent-[var(--brand-blue)]"
          />
          Remember me
        </label>

        {state.error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="size-4 shrink-0" />
            {state.error}
          </div>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="h-13 w-full rounded-xl bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-cyan)] text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:opacity-95 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-70"
        >
          {pending ? "Signing in…" : "Log in"}
        </Button>
      </form>
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
