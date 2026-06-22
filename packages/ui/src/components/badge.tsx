// shadcn-source: https://ui.shadcn.com/docs/components/badge (cli, 2026-05-26)
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/ui/lib/cn"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 overflow-hidden rounded-badge border px-1 typography-caption font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        success:
          "border-state-scored-subtle bg-state-scored-subtle text-state-scored-text",
        running:
          "border-state-running-subtle bg-state-running-subtle text-state-running-text",
        info:
          "border-state-running bg-transparent text-state-running-text",
        beta:
          "border-state-running bg-transparent text-state-running-text",
        warning:
          "border-state-warning-subtle bg-state-warning-subtle text-state-warning-text",
        destructive:
          "border-state-errored-subtle bg-state-errored-subtle text-state-errored-text",
        neutral:
          "border-border bg-muted-surface text-muted-foreground",
        "brand-soft":
          "border-primary-border bg-primary-soft text-primary",
      },
      size: {
        md: "py-px",
        sm: "py-0 leading-none",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  }
)

const dotVariants = cva("size-1.5 shrink-0 rounded-full", {
  variants: {
    variant: {
      success: "bg-state-scored",
      running: "animate-running-pulse bg-state-running",
      info: "hidden",
      beta: "hidden",
      warning: "bg-state-warning",
      destructive: "bg-state-errored",
      neutral: "hidden",
      "brand-soft": "hidden",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
})

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Show the status dot (only renders for success/running/warning/destructive variants) */
  showDot?: boolean
  /** Strip chip chrome (bg, border, padding). Keeps tone's text + dot color. */
  bare?: boolean
  /** Chip height. `md` = default (py-px); `sm` = compact (no vertical padding, leading-none). */
  size?: "md" | "sm"
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "neutral", size = "md", showDot = false, bare = false, children, ...props }, ref) => {
    const noDotVariants = new Set(["info", "beta", "neutral", "brand-soft"])
    const hasDot = showDot && !noDotVariants.has(variant ?? "neutral")

    return (
      <span
        ref={ref}
        data-slot="badge"
        data-variant={variant}
        data-bare={bare || undefined}
        className={cn(
          badgeVariants({ variant, size }),
          bare && "border-transparent bg-transparent px-0",
          className,
        )}
        {...props}
      >
        {hasDot && (
          <span
            aria-hidden="true"
            className={cn(dotVariants({ variant }))}
          />
        )}
        {children}
      </span>
    )
  }
)

Badge.displayName = "Badge"

export { Badge, badgeVariants }
