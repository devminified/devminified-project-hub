"use client"

import { useEffect, useId, useState } from "react"

type Mermaid = typeof import("mermaid").default

let mermaidPromise: Promise<Mermaid> | null = null

// Imported on demand (keeps the bundle off pages without diagrams) and
// initialised once. "strict" makes Mermaid sanitize labels and disables click
// handlers, which matters because the SVG is injected as raw HTML below.
function loadMermaid(): Promise<Mermaid> {
  mermaidPromise ??= import("mermaid")
    .then((m) => {
      m.default.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        // We show our own fallback instead of Mermaid's "Syntax error" bomb SVG
        suppressErrorRendering: true,
      })
      return m.default
    })
    .catch((err) => {
      mermaidPromise = null // allow a retry on the next render
      throw err
    })
  return mermaidPromise
}

const DEFAULT_ERROR_MESSAGE =
  "Failed to render diagram. The diagram syntax may be invalid."

/**
 * Renders a Mermaid diagram from its source text. If the diagram fails to
 * parse, shows an error message with a toggle to reveal the raw source.
 *
 * - `errorMessage`: text shown when rendering fails.
 * - `showSourceOnFailure`: whether the source starts expanded on failure
 *   (it can still be toggled). Only read on mount.
 */
export function MermaidDiagram({
  chart,
  errorMessage = DEFAULT_ERROR_MESSAGE,
  showSourceOnFailure = false,
}: {
  chart: string
  errorMessage?: string
  showSourceOnFailure?: boolean
}) {
  // useId() returns something like ":r1:" and Mermaid rejects the colons
  const id = "mermaid-" + useId().replace(/:/g, "")
  const [svg, setSvg] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [showSource, setShowSource] = useState(showSourceOnFailure)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const mermaid = await loadMermaid()
        const { svg } = await mermaid.render(id, chart)
        if (!cancelled) {
          setSvg(svg)
          setFailed(false)
        }
      } catch {
        // A failed render can leave its temporary container behind in <body>
        document.getElementById("d" + id)?.remove()
        if (!cancelled) setFailed(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [chart, id])

  if (failed) {
    return (
      <div className="my-4">
        <p role="alert" className="text-sm font-medium text-red-600">
          {errorMessage}{" "}
          <button
            type="button"
            onClick={() => setShowSource((v) => !v)}
            aria-expanded={showSource}
            className="underline underline-offset-2 hover:opacity-80"
          >
            {showSource ? "Hide Mermaid code" : "Show Mermaid code"}
          </button>
        </p>
        {showSource && (
          <pre className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-slate-900 p-4 font-mono text-[13px] leading-relaxed text-slate-100">
            {chart}
          </pre>
        )}
      </div>
    )
  }
  if (!svg) {
    return <div className="my-4 h-24 animate-pulse rounded-lg bg-slate-100" />
  }
  return (
    <div
      role="img"
      aria-label="Diagram"
      className="my-4 flex justify-center overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
