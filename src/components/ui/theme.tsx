"use client"

import * as React from "react"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type Theme = "light" | "dark" | "system"

const STORAGE_KEY = "dm-theme"

/**
 * Blocking script that applies the stored theme before first paint, so there
 * is no flash of the wrong theme. Render it inside <head> in the root layout,
 * and put `suppressHydrationWarning` on <html> (this mutates the class before
 * React hydrates).
 */
function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
    STORAGE_KEY
  )})||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(e){}})()`
  return <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: script }} />
}

function apply(theme: Theme) {
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  const root = document.documentElement
  root.classList.toggle("dark", dark)
  root.style.colorScheme = dark ? "dark" : "light"
}

/* The stored theme lives in localStorage, i.e. outside React. Reading it with
   useSyncExternalStore (rather than a mount effect) means no extra render and
   no server/client snapshot mismatch. */
const themeListeners = new Set<() => void>()

function subscribeTheme(onChange: () => void) {
  themeListeners.add(onChange)
  // Keep tabs in sync with each other.
  window.addEventListener("storage", onChange)
  return () => {
    themeListeners.delete(onChange)
    window.removeEventListener("storage", onChange)
  }
}

function readTheme(): Theme {
  try {
    return (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system"
  } catch {
    return "system"
  }
}

/** Read + set the active theme. Persists to localStorage. */
function useTheme() {
  const theme = React.useSyncExternalStore(
    subscribeTheme,
    readTheme,
    () => "system" as Theme
  )

  // Follow the OS while in `system` mode.
  React.useEffect(() => {
    if (theme !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => apply("system")
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [theme])

  const setTheme = React.useCallback((next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next)
    apply(next)
    themeListeners.forEach((l) => l())
  }, [])

  return { theme, setTheme }
}

/* `true` only after hydration — used to avoid rendering an icon that
   disagrees with what ThemeScript already applied to <html>. */
const noop = () => () => {}
const useMounted = () =>
  React.useSyncExternalStore(
    noop,
    () => true,
    () => false
  )

const order: Theme[] = ["light", "dark", "system"]
const meta: Record<Theme, { icon: React.ElementType; label: string }> = {
  light: { icon: SunIcon, label: "Light" },
  dark: { icon: MoonIcon, label: "Dark" },
  system: { icon: MonitorIcon, label: "System" },
}

/**
 * Cycles light → dark → system. Renders nothing until mounted so the icon
 * never disagrees with the pre-paint script.
 */
function ThemeToggle({
  className,
  size = "icon-sm",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "onClick" | "children">) {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  const current = meta[theme]
  const Icon = current.icon
  const next = order[(order.indexOf(theme) + 1) % order.length]

  return (
    <Button
      variant="ghost"
      size={size}
      aria-label={`Theme: ${current.label}. Switch to ${meta[next].label}.`}
      title={`Theme: ${current.label}`}
      onClick={() => setTheme(next)}
      className={cn("text-muted-foreground hover:text-foreground", className)}
      {...props}
    >
      {mounted ? <Icon /> : <span className="size-4" />}
    </Button>
  )
}

export { ThemeScript, ThemeToggle, useTheme }
