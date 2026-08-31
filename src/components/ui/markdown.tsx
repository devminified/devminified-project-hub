"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"

/**
 * Renders markdown as formatted content (headings, code, links, lists,
 * tables, …) for README / doc previews. Every colour comes from a semantic
 * token, so the same markdown reads correctly in light and dark.
 */
export function Markdown({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "markdown-body text-sm leading-relaxed text-pretty text-foreground",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => (
            <h1
              className="mt-7 mb-3 border-b border-border pb-2 font-heading text-2xl font-semibold text-foreground first:mt-0"
              {...props}
            />
          ),
          h2: (props) => (
            <h2
              className="mt-7 mb-3 border-b border-border pb-2 font-heading text-xl font-semibold text-foreground first:mt-0"
              {...props}
            />
          ),
          h3: (props) => (
            <h3
              className="mt-6 mb-2 font-heading text-lg font-semibold text-foreground"
              {...props}
            />
          ),
          h4: (props) => (
            <h4
              className="mt-5 mb-2 font-heading text-base font-semibold text-foreground"
              {...props}
            />
          ),
          h5: (props) => (
            <h5 className="mt-4 mb-2 text-sm font-semibold text-foreground" {...props} />
          ),
          h6: (props) => (
            <h6
              className="mt-4 mb-2 text-2xs font-semibold tracking-wide text-muted-foreground uppercase"
              {...props}
            />
          ),
          p: (props) => <p className="my-3 leading-7" {...props} />,
          a: (props) => (
            <a
              className="rounded-xs font-medium text-primary underline underline-offset-2 hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              target="_blank"
              rel="noreferrer noopener"
              {...props}
            />
          ),
          ul: (props) => <ul className="my-3 list-disc space-y-1 pl-6" {...props} />,
          ol: (props) => <ol className="my-3 list-decimal space-y-1 pl-6" {...props} />,
          li: (props) => <li className="leading-7 marker:text-muted-foreground" {...props} />,
          blockquote: (props) => (
            <blockquote
              className="my-4 rounded-r-md border-l-2 border-primary/40 bg-surface-subtle py-2 pl-4 text-muted-foreground"
              {...props}
            />
          ),
          hr: () => <hr className="my-6 border-border" />,
          img: (props) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="my-4 max-w-full rounded-lg border border-border" alt="" {...props} />
          ),
          table: (props) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-sm" {...props} />
            </div>
          ),
          th: (props) => (
            <th
              className="border-b border-border bg-surface-subtle px-3 py-2 text-left text-2xs font-semibold tracking-wide text-muted-foreground uppercase"
              {...props}
            />
          ),
          td: (props) => (
            <td className="border-b border-border px-3 py-2 last:border-b-0" {...props} />
          ),
          code: ({ className: codeClass, children, ...props }) => {
            const isBlock = /language-/.test(codeClass ?? "")
            if (isBlock) {
              return (
                <code className={cn("font-mono text-xs", codeClass)} {...props}>
                  {children}
                </code>
              )
            }
            return (
              <code
                className="rounded-sm bg-surface-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
                {...props}
              >
                {children}
              </code>
            )
          },
          pre: (props) => (
            <pre
              className="my-4 overflow-x-auto rounded-lg border border-border bg-code p-4 font-mono text-xs leading-relaxed text-code-foreground"
              {...props}
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
