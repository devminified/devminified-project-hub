"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"

/**
 * Renders markdown text as formatted content (headings, code blocks, links,
 * lists, tables, …). Used to preview README / doc files instead of showing the
 * raw source. Styling matches the app's slate palette.
 */
export function Markdown({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <div className={cn("markdown-body text-sm leading-relaxed text-slate-700", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => (
            <h1
              className="mt-6 mb-3 border-b border-slate-200 pb-1.5 text-2xl font-bold text-slate-900 first:mt-0"
              {...props}
            />
          ),
          h2: (props) => (
            <h2
              className="mt-6 mb-3 border-b border-slate-200 pb-1.5 text-xl font-semibold text-slate-900 first:mt-0"
              {...props}
            />
          ),
          h3: (props) => (
            <h3 className="mt-5 mb-2 text-lg font-semibold text-slate-900" {...props} />
          ),
          h4: (props) => (
            <h4 className="mt-4 mb-2 text-base font-semibold text-slate-900" {...props} />
          ),
          h5: (props) => (
            <h5 className="mt-4 mb-2 text-sm font-semibold text-slate-900" {...props} />
          ),
          h6: (props) => (
            <h6 className="mt-4 mb-2 text-sm font-semibold text-slate-500" {...props} />
          ),
          p: (props) => <p className="my-3 leading-7" {...props} />,
          a: (props) => (
            <a
              className="font-medium text-[var(--brand-blue)] underline underline-offset-2 hover:opacity-80"
              target="_blank"
              rel="noreferrer noopener"
              {...props}
            />
          ),
          ul: (props) => (
            <ul className="my-3 list-disc space-y-1 pl-6" {...props} />
          ),
          ol: (props) => (
            <ol className="my-3 list-decimal space-y-1 pl-6" {...props} />
          ),
          li: (props) => <li className="leading-7" {...props} />,
          blockquote: (props) => (
            <blockquote
              className="my-3 border-l-4 border-slate-200 pl-4 text-slate-500 italic"
              {...props}
            />
          ),
          hr: () => <hr className="my-6 border-slate-200" />,
          img: (props) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="my-3 max-w-full rounded-lg border border-slate-200" alt="" {...props} />
          ),
          table: (props) => (
            <div className="my-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm" {...props} />
            </div>
          ),
          th: (props) => (
            <th
              className="border border-slate-200 bg-slate-50 px-3 py-1.5 text-left font-semibold text-slate-700"
              {...props}
            />
          ),
          td: (props) => (
            <td className="border border-slate-200 px-3 py-1.5" {...props} />
          ),
          code: ({ className: codeClass, children, ...props }) => {
            const isBlock = /language-/.test(codeClass ?? "")
            if (isBlock) {
              return (
                <code className={cn("font-mono text-[13px]", codeClass)} {...props}>
                  {children}
                </code>
              )
            }
            return (
              <code
                className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-800"
                {...props}
              >
                {children}
              </code>
            )
          },
          pre: (props) => (
            <pre
              className="my-4 overflow-x-auto rounded-lg border border-slate-200 bg-slate-900 p-4 font-mono text-[13px] leading-relaxed text-slate-100"
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
