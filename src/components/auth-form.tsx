"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
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
        <h1
          className="dm-animate-in text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl"
          style={{ animationDelay: "0.1s" }}
        >
          Welcome back
        </h1>
        <p
          className="dm-animate-in mt-3 text-sm text-slate-500 sm:text-base lg:text-lg"
          style={{ animationDelay: "0.2s" }}
        >
          Sign in to access your Project Hub.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <div className="dm-animate-in" style={{ animationDelay: "0.3s" }}>
          <Field label="Email">
            <FieldIcon>
              <Mail className="size-4 sm:size-5" />
            </FieldIcon>
            <Input
              type="email"
              name="email"
              required
              placeholder="you@company.com"
              className="h-13 rounded-xl pl-11 text-base"
            />
          </Field>
        </div>

        <div className="dm-animate-in" style={{ animationDelay: "0.4s" }}>
          <Field label="Password">
            <FieldIcon>
              <Lock className="size-4 sm:size-5" />
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
                <EyeOff className="size-4 sm:size-5" />
              ) : (
                <Eye className="size-4 sm:size-5" />
              )}
            </button>
          </Field>
        </div>

        <label
          className="dm-animate-in flex items-center gap-2.5 text-sm text-slate-500"
          style={{ animationDelay: "0.5s" }}
        >
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
          style={{ animationDelay: "0.6s" }}
          className="dm-animate-in h-13 w-full rounded-xl bg-[var(--brand-primary)] text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:opacity-95 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-70"
        >
          {pending ? "Signing in…" : "Log in"}
        </Button>
      </form>

      <p
        className="dm-animate-in mt-6 text-center text-sm text-slate-500"
        style={{ animationDelay: "0.7s" }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-[var(--brand-primary)] hover:underline"
        >
          Sign up
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
