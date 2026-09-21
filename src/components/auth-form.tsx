"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react"

import { login, type LoginState } from "@/app/login/actions"

/** Field shell: the 1.5px bordered row that holds a leading icon + the input. */
const fieldShell =
  "flex items-center gap-2.5 rounded-[10px] border-[1.5px] border-[#D6E0EF] bg-white px-3.5 transition-[border-color,box-shadow] duration-150 focus-within:border-[#1A66F0] focus-within:shadow-[0_0_0_4px_rgba(26,102,240,0.12)]"

const fieldInput =
  "min-w-0 flex-1 border-0 bg-transparent py-3 text-[14.5px] text-[#0B1B33] outline-none placeholder:text-[#A9B7CC]"

export function AuthForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    {}
  )

  return (
    <div className="w-full">
      <h1
        className="dm-animate-in font-display text-[30px] font-bold tracking-[-0.025em]"
        style={{ animationDelay: "0.05s" }}
      >
        Welcome back
      </h1>
      <p
        className="dm-animate-in mt-2 mb-7 text-[15px] text-[#5B6B85]"
        style={{ animationDelay: "0.12s" }}
      >
        Sign in to access your Project Hub.
      </p>

      <form action={formAction} className="flex flex-col gap-[18px]">
        <label
          className="dm-animate-in flex flex-col gap-[7px]"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="text-[13px] font-semibold text-[#16294A]">Email</span>
          <div className={fieldShell}>
            <Mail className="size-[18px] shrink-0 text-[#8496AF]" />
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              className={fieldInput}
            />
          </div>
        </label>

        <label
          className="dm-animate-in flex flex-col gap-[7px]"
          style={{ animationDelay: "0.28s" }}
        >
          <span className="text-[13px] font-semibold text-[#16294A]">
            Password
          </span>
          <div className={fieldShell}>
            <Lock className="size-[18px] shrink-0 text-[#8496AF]" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={fieldInput}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="-mr-1 grid size-7 shrink-0 place-items-center rounded-md text-[#8496AF] transition-colors hover:text-[#1A66F0]"
            >
              {showPassword ? (
                <EyeOff className="size-[18px]" />
              ) : (
                <Eye className="size-[18px]" />
              )}
            </button>
          </div>
        </label>

        <label
          className="dm-animate-in flex w-fit cursor-pointer items-center gap-2.5"
          style={{ animationDelay: "0.36s" }}
        >
          <input
            type="checkbox"
            name="remember"
            className="size-[18px] shrink-0 rounded-[5px] border-[1.5px] border-[#D6E0EF] accent-[#1A66F0]"
          />
          <span className="text-[14px] text-[#5B6B85]">Remember me</span>
        </label>

        {state.error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-[10px] border-[1.5px] border-[#F4CFCF] bg-[#FDECEC] px-3.5 py-3 text-[14px] leading-[1.5] text-[#C62828]"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          style={{ animationDelay: "0.44s" }}
          className="dm-animate-in font-display w-full rounded-[10px] bg-[#1A66F0] px-5 py-3.5 text-[15px] font-semibold text-white transition-all duration-150 hover:bg-[#0F4FD1] hover:shadow-[0_8px_22px_rgba(26,102,240,0.28)] active:scale-[.99] disabled:pointer-events-none disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Log in"}
        </button>

        <div
          className="dm-animate-in text-center text-[14px] text-[#5B6B85]"
          style={{ animationDelay: "0.52s" }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#1A66F0] hover:text-[#0F4FD1]"
          >
            Sign up
          </Link>
        </div>
      </form>
    </div>
  )
}
