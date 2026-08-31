import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

/**
 * Form field wrapper: label + control + description + error, with the
 * `id` / `aria-describedby` / `aria-invalid` wiring done for you.
 *
 * ```tsx
 * <Field label="Project name" description="Shown on the card." error={errors.name} required>
 *   <Input name="name" placeholder="Atlas Billing" />
 * </Field>
 * ```
 *
 * `children` must be a single element that accepts `id` and `aria-*`. For
 * anything more exotic, compose the exported parts by hand instead.
 */
function Field({
  className,
  label,
  description,
  error,
  required,
  disabled,
  htmlFor,
  orientation = "vertical",
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: React.ReactNode
  required?: boolean
  disabled?: boolean
  /** Override the generated control id (e.g. when the control sets its own). */
  htmlFor?: string
  orientation?: "vertical" | "horizontal"
  children: React.ReactNode
}) {
  const generatedId = React.useId()
  const controlId = htmlFor ?? `${generatedId}-control`
  const descriptionId = description ? `${generatedId}-description` : undefined
  const errorId = error ? `${generatedId}-error` : undefined
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined

  const control = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id: (children.props as { id?: string }).id ?? controlId,
        "aria-describedby":
          (children.props as { "aria-describedby"?: string })[
            "aria-describedby"
          ] ?? describedBy,
        "aria-invalid":
          (children.props as { "aria-invalid"?: boolean })["aria-invalid"] ??
          (error ? true : undefined),
        required:
          (children.props as { required?: boolean }).required ?? required,
        disabled:
          (children.props as { disabled?: boolean }).disabled ?? disabled,
      })
    : children

  return (
    <div
      data-slot="field"
      data-disabled={disabled || undefined}
      data-invalid={error ? true : undefined}
      data-orientation={orientation}
      className={cn(
        "group/field flex min-w-0 flex-col gap-1.5",
        orientation === "horizontal" &&
          "sm:grid sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] sm:items-start sm:gap-x-6 sm:gap-y-1",
        className
      )}
      {...props}
    >
      {label ? (
        <Label
          htmlFor={controlId}
          data-required={required || undefined}
          className={cn(orientation === "horizontal" && "sm:pt-2.5")}
        >
          {label}
        </Label>
      ) : null}

      <div className="flex min-w-0 flex-col gap-1.5">
        {control}
        {description ? (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        ) : null}
        {error ? <FieldError id={errorId}>{error}</FieldError> : null}
      </div>
    </div>
  )
}

/** Stacks several <Field>s with a consistent rhythm. */
function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

/** Side-by-side fields that collapse to one column on small screens. */
function FieldRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-row"
      className={cn("grid gap-4 sm:grid-cols-2", className)}
      {...props}
    />
  )
}

function FieldLabel(props: React.ComponentProps<typeof Label>) {
  return <Label data-slot="field-label" {...props} />
}

function FieldDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function FieldError({ className, children, ...props }: React.ComponentProps<"p">) {
  if (!children) return null
  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium text-destructive",
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}

export { Field, FieldGroup, FieldRow, FieldLabel, FieldDescription, FieldError }
