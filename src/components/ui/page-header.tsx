import * as React from "react"
import Link from "next/link"
import { ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { SidebarTrigger } from "@/components/animate-ui/components/radix/sidebar"

/**
 * The sticky bar at the top of every screen. Owns the sidebar trigger, the
 * page title, the breadcrumb and the primary actions, so no screen has to
 * re-invent the header height, blur, or border.
 *
 * ```tsx
 * <PageHeader
 *   title="Projects"
 *   description="6 projects"
 *   breadcrumb={[{ label: "Projects", href: "/" }, { label: "Atlas Billing" }]}
 *   actions={<Button>New project</Button>}
 * />
 * ```
 *
 * The `<h1>` is rendered here, so pages should not render another one.
 */
function PageHeader({
  className,
  title,
  description,
  icon,
  breadcrumb,
  actions,
  sticky = true,
  children,
  ...props
}: Omit<React.ComponentProps<"header">, "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  breadcrumb?: { label: React.ReactNode; href?: string }[]
  actions?: React.ReactNode
  /** Set false for headers inside a scroll container that shouldn't pin. */
  sticky?: boolean
}) {
  return (
    <header
      data-slot="page-header"
      className={cn(
        "z-20 flex min-h-(--header-height) flex-wrap items-center gap-x-3 gap-y-2 border-b border-border bg-background/85 py-3 page-gutter",
        "supports-backdrop-filter:bg-background/70 supports-backdrop-filter:backdrop-blur-md",
        sticky && "sticky top-0",
        className
      )}
      {...props}
    >
      <SidebarTrigger className="-ms-1.5 shrink-0" />

      <div className="flex min-w-0 flex-1 items-center gap-3">
        {icon ? (
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary-subtle-foreground [&>svg]:size-4.5"
          >
            {icon}
          </span>
        ) : null}

        <div className="flex min-w-0 flex-col">
          {breadcrumb?.length ? <PageBreadcrumb items={breadcrumb} /> : null}
          <h1 className="truncate font-heading text-xl leading-tight font-semibold text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="truncate text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>

      {actions ? (
        <div
          data-slot="page-header-actions"
          className="flex shrink-0 flex-wrap items-center gap-2"
        >
          {actions}
        </div>
      ) : null}
      {children}
    </header>
  )
}

/** Breadcrumb trail. The last item is rendered as the current page. */
function PageBreadcrumb({
  className,
  items,
  ...props
}: Omit<React.ComponentProps<"nav">, "children"> & {
  items: { label: React.ReactNode; href?: string }[]
}) {
  return (
    <nav
      data-slot="page-breadcrumb"
      aria-label="Breadcrumb"
      className={cn("min-w-0", className)}
      {...props}
    >
      <ol className="flex min-w-0 items-center gap-1 text-2xs text-muted-foreground">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={i} className="flex min-w-0 items-center gap-1">
              {i > 0 ? (
                <ChevronRightIcon aria-hidden="true" className="size-3 shrink-0 opacity-60" />
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="truncate rounded-xs hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="truncate"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/**
 * Content column below a <PageHeader>. Applies the shared gutter and caps the
 * line length on very wide screens.
 *
 * @param size `narrow` (48rem) for prose/forms, `default` (--page-max) for
 *   dashboards, `full` to opt out of the cap.
 */
function PageContainer({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "narrow" | "default" | "full" }) {
  return (
    <div
      data-slot="page-container"
      className={cn(
        "w-full py-6 page-gutter lg:py-8",
        size === "narrow" && "mx-auto max-w-3xl",
        size === "default" && "mx-auto max-w-(--page-max)",
        className
      )}
      {...props}
    />
  )
}

/** Section heading inside a page: title, optional description and actions. */
function SectionHeader({
  className,
  title,
  description,
  actions,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div
      data-slot="section-header"
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-4 gap-y-2",
        className
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="font-heading text-lg leading-tight font-semibold text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-pretty text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}

export { PageHeader, PageBreadcrumb, PageContainer, SectionHeader }
