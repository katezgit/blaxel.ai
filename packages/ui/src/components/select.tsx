// shadcn-source: https://ui.shadcn.com/docs/components/select (cli, 2026-05-26)
import * as React from "react"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { Select as SelectPrimitive } from "radix-ui"

import { cn } from "@repo/ui/lib/cn"
import { formFieldBoxVariants } from "@repo/ui/lib/form-field-box"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "md",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "md"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "group/trigger",
        "flex w-fit items-center justify-between gap-2 whitespace-nowrap",
        formFieldBoxVariants({ size }),
        "data-[placeholder]:text-meta-foreground",
        // typography-body (14px) — no text-foreground pairing here to avoid twMerge conflict with consumer overrides.
        // typography-body is already emitted by formFieldBoxVariants size=md; kept here as a noop fallback guard.
        // Lift to form-field surface on focus — light: #FFFFFF, dark: #11161F. Tracks --color-card (formerly --color-panel).
        "focus-visible:bg-form-field-surface data-[state=open]:bg-form-field-surface",
        "data-[state=open]:shadow-focus-ring",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        "*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0",
            "text-muted-foreground",
            "transition-transform duration-fast ease-out-standard",
            "group-data-[state=open]/trigger:rotate-180",
          )}
          aria-hidden="true"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  sideOffset = 8,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        sideOffset={sideOffset}
        position={position}
        className={cn(
          "relative z-overlay overflow-hidden",
          "bg-popover text-foreground typography-body",
          // shadow-popover carries depth only (no ring); DS ships the border so SelectContent has a crisp edge matching other popover-tier surfaces.
          "rounded-lg",
          "shadow-popover border border-border",
          "min-w-[8rem]",
          "max-h-[240px]",
          "origin-(--radix-select-content-transform-origin)",
          "data-[state=open]:animate-slide-up-in",
          "data-[state=closed]:animate-slide-down-out",
          position === "popper" && [
            "data-[side=bottom]:translate-y-1",
            "data-[side=left]:-translate-x-1",
            "data-[side=right]:translate-x-1",
            "data-[side=top]:-translate-y-1",
          ],
          className
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width) scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        "px-2 pt-3 pb-1 first:pt-2",
        "typography-meta tracking-normal font-sans text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

/**
 * SelectItem — Radix Select item with optional custom dropdown row via `renderItem`.
 *
 * `renderItem` prop:
 *   () => ReactNode — when provided, renders as the visible dropdown row content.
 *   The `children` are still passed through `SelectPrimitive.ItemText` (sr-only when
 *   renderItem is active) so the trigger label and Radix typeahead both work correctly.
 *
 * Default (no renderItem): children render normally in both dropdown row and trigger.
 *
 * Example:
 *   <SelectItem
 *     value="admin"
 *     renderItem={() => (
 *       <div className="flex items-start gap-2">
 *         <Shield className="size-4 mt-0.5 text-muted-foreground" />
 *         <div className="flex flex-col gap-0.5">
 *           <span>Admin</span>
 *           <span className="typography-caption text-muted-foreground">
 *             Can edit resources and invite users.
 *           </span>
 *         </div>
 *       </div>
 *     )}
 *   >
 *     Admin
 *   </SelectItem>
 */
function SelectItem({
  className,
  children,
  renderItem,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item> & {
  renderItem?: () => React.ReactNode
}) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default select-none gap-2",
        // items-start so the check indicator aligns to the title row of multi-line renderItem content.
        "items-start",
        "rounded-sm py-1.5 pr-8 pl-2",
        "outline-hidden",
        // Radix's data-[highlighted] fires on both pointer hover + keyboard nav — sidesteps the
        // Tailwind v4 :hover/:focus cascade where focus: always wins. No font-medium on highlight
        // or selected (weight shift jitters glyphs across rows; selection is signaled by indicator).
        "data-[highlighted]:bg-highlight-surface",
        // Suppress global *:focus-visible ring — bg-highlight-surface is the sole active-option indicator.
        // Forced-colors fallback restores a visible outline in Windows HC mode.
        "focus-visible:shadow-none focus-visible:outline-none",
        "forced-colors:focus-visible:outline-2 forced-colors:focus-visible:outline-current",
        "data-[highlighted]:[&_svg]:text-foreground",
        "[&_svg]:text-muted-foreground",
        // cursor-not-allowed kept without pointer-events-none — Radix gates clicks internally.
        "data-[disabled]:cursor-not-allowed data-[disabled]:text-text-disabled",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // Default (no renderItem): cascade flex + items-center + gap-2 onto the ItemText span.
        !renderItem && "*:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      {/* Check indicator — positioned absolute right-edge, vertically centered on the full row */}
      <span
        data-slot="select-item-indicator"
        className="absolute right-2 top-1/2 -translate-y-1/2 flex size-3.5 items-center justify-center"
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4 text-foreground" />
        </SelectPrimitive.ItemIndicator>
      </span>

      {renderItem ? (
        <>
          {/*
           * ItemText is visually hidden (sr-only) when renderItem is provided.
           * It still wraps children so:
           *   1. Radix's typeahead uses it for keyboard character matching.
           *   2. The trigger's SelectValue reads the text content from it.
           * renderItem() controls all visible output inside the dropdown row.
           */}
          <SelectPrimitive.ItemText asChild>
            <span className="sr-only">{children}</span>
          </SelectPrimitive.ItemText>
          {renderItem()}
        </>
      ) : (
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      )}
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4 text-muted-foreground" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4 text-muted-foreground" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
