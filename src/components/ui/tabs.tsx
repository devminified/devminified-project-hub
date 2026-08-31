"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  Tabs as TabsPrimitive,
  TabsList as TabsListPrimitive,
  TabsTrigger as TabsTriggerPrimitive,
  TabsContent as TabsContentPrimitive,
  TabsContents as TabsContentsPrimitive,
  TabsHighlight as TabsHighlightPrimitive,
  TabsHighlightItem as TabsHighlightItemPrimitive,
  type TabsProps as TabsPrimitiveProps,
  type TabsListProps as TabsListPrimitiveProps,
  type TabsTriggerProps as TabsTriggerPrimitiveProps,
  type TabsContentProps as TabsContentPrimitiveProps,
  type TabsContentsProps as TabsContentsPrimitiveProps,
} from "@/components/animate-ui/primitives/radix/tabs"

type Variant = "line" | "pill"

const VariantContext = React.createContext<Variant>("line")

type TabsProps = TabsPrimitiveProps & {
  /**
   * `line` — underlined trail, for primary in-page navigation.
   * `pill` — segmented control on a muted track, for filters and toggles.
   */
  variant?: Variant
}

/**
 * Animated tabs. The active indicator slides between triggers (and respects
 * `prefers-reduced-motion` via the app-level MotionConfig).
 *
 * ```tsx
 * <Tabs defaultValue="details" variant="line">
 *   <TabsList>
 *     <TabsTrigger value="details">Details</TabsTrigger>
 *     <TabsTrigger value="envs">ENVs <Badge variant="muted" size="sm">5</Badge></TabsTrigger>
 *   </TabsList>
 *   <TabsContents>
 *     <TabsContent value="details">…</TabsContent>
 *   </TabsContents>
 * </Tabs>
 * ```
 */
function Tabs({ className, variant = "line", ...props }: TabsProps) {
  return (
    <VariantContext.Provider value={variant}>
      <TabsPrimitive
        data-slot="tabs"
        data-variant={variant}
        className={cn("flex flex-col gap-4", className)}
        {...props}
      />
    </VariantContext.Provider>
  )
}

type TabsListProps = TabsListPrimitiveProps

function TabsList({ className, ...props }: TabsListProps) {
  const variant = React.useContext(VariantContext)

  return (
    <TabsHighlightPrimitive
      className={cn(
        "absolute z-0",
        variant === "pill"
          ? "inset-0 rounded-md border border-border bg-card shadow-xs"
          : "inset-x-0 bottom-0 h-0.5 rounded-full bg-primary"
      )}
    >
      <TabsListPrimitive
        data-slot="tabs-list"
        className={cn(
          "inline-flex w-fit max-w-full items-center overflow-x-auto no-scrollbar",
          variant === "pill"
            ? "h-9 justify-center gap-0 rounded-lg bg-surface-muted p-[3px]"
            : "h-10 gap-1 border-b border-border",
          className
        )}
        {...props}
      />
    </TabsHighlightPrimitive>
  )
}

type TabsTriggerProps = TabsTriggerPrimitiveProps

function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  const variant = React.useContext(VariantContext)

  return (
    <TabsHighlightItemPrimitive
      value={props.value}
      className={variant === "pill" ? "flex-1" : undefined}
    >
      <TabsTriggerPrimitive
        data-slot="tabs-trigger"
        className={cn(
          "relative z-10 inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium",
          "text-muted-foreground transition-colors duration-(--animate-duration-base) ease-(--ease-standard)",
          "hover:text-foreground data-[state=active]:text-foreground",
          "outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
          "disabled:pointer-events-none disabled:opacity-55",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          variant === "pill"
            ? "h-full w-full flex-1 rounded-md px-3 text-xs"
            : "h-10 rounded-t-md px-3 text-sm data-[state=active]:text-primary",
          className
        )}
        {...props}
      />
    </TabsHighlightItemPrimitive>
  )
}

type TabsContentsProps = TabsContentsPrimitiveProps

function TabsContents(props: TabsContentsProps) {
  return <TabsContentsPrimitive data-slot="tabs-contents" {...props} />
}

type TabsContentProps = TabsContentPrimitiveProps

function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <TabsContentPrimitive
      data-slot="tabs-content"
      className={cn(
        "flex-1 rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className
      )}
      {...props}
    />
  )
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContents,
  TabsContent,
  type TabsProps,
  type TabsListProps,
  type TabsTriggerProps,
  type TabsContentsProps,
  type TabsContentProps,
}
