// shadcn-source: https://ui.shadcn.com/docs/components/button (cli, 2026-05-26)
import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/ui/lib/cn"
import { buttonBaseClasses } from "./button-base"

// ── Disabled selector strategy ────────────────────────────────────────────────
// Three disabled paths:
//   1. Native `disabled` — non-focusable, click blocked by browser, CSS via :disabled
//   2. aria-disabled="true" — stays in tab order; onClick suppressed in component;
//      visual parity with (1). Use for tooltips, permission gates, loading states.
//   3. loading — aria-disabled="true" + data-loading="true"; spinner overlays label;
//      MUST NOT pick up disabled bg/text tokens (loading is "busy", not "invalid").
//      Guards: disabled:[&:not([data-loading])]:* and [aria-disabled='true']:[&:not([data-loading])]:*
//
// Mantine/Primer pattern: :disabled:not([data-loading]) / [aria-disabled]:not([data-loading])
// prevents the loading state from inheriting the greyed-disabled look.
//
// Ghost variants on tinted surfaces (e.g. --color-muted-surface) have a known
// disabled-readability issue — text-disabled over muted-surface is low contrast.
// Out of scope for this PR; flagged in issue #116 for a follow-up contrast audit.
// ─────────────────────────────────────────────────────────────────────────────

// Disabled bg guard: applies only when NOT loading. Both native disabled and aria-disabled paths.
// Utility classes reference named @theme tokens → rank-1 generated utilities (Tailwind v4 §1).
const disabledBg = (utilityClass: string) =>
  [
    `disabled:[&:not([data-loading])]:${utilityClass}`,
    `[aria-disabled='true']:[&:not([data-loading])]:${utilityClass}`,
  ] as const

const buttonVariants = cva(
  [
    ...buttonBaseClasses,
    "h-8 px-3.5 py-0 typography-body font-medium rounded-lg gap-2 [&_svg]:size-4",
  ],
  {
    variants: {
      variant: {
        primary: [
          "font-mono bg-primary text-primary-foreground",
          "hover:bg-primary-hover",
          "active:bg-primary-hover",
          // Dim background only — text inherits base disabled:text-text-disabled.
          // bg-button-disabled-bg-filled aliases --color-muted-surface via @theme.
          // The neutral muted surface reads as "off" rather than "soft primary" —
          // orange-tinted disabled bgs would read as tinted secondaries.
          ...disabledBg("bg-button-disabled-bg-filled"),
        ],

        secondary: [
          "border border-border bg-transparent text-foreground",
          "hover:bg-secondary-surface",
          "active:bg-selected-surface",
          // Ghost-family: transparent bg in all disabled paths
          ...disabledBg("bg-button-disabled-bg-ghost"),
        ],

        ghost: [
          "bg-transparent text-foreground",
          "hover:bg-hover-surface",
          "active:bg-selected-surface",
          ...disabledBg("bg-button-disabled-bg-ghost"),
        ],

        // Teal ring clashes on a red fill — override to destructive outline + errored glow.
        destructive: [
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive-hover",
          "active:bg-destructive-active",
          // bg-button-disabled-bg-filled-destructive aliases --color-state-errored-subtle.
          // Destructive disabled keeps errored text token (not base text-disabled) so the
          // severity signal is preserved even in the off state.
          ...disabledBg("bg-button-disabled-bg-filled-destructive"),
          "disabled:[&:not([data-loading])]:text-state-errored-text [aria-disabled='true']:[&:not([data-loading])]:text-state-errored-text",
          "focus-visible:outline-destructive focus-visible:shadow-focus-errored",
        ],

        "destructive-ghost": [
          "bg-transparent text-state-errored",
          "hover:bg-state-errored-subtle hover:text-state-errored-text",
          "active:bg-state-errored-subtle",
          ...disabledBg("bg-button-disabled-bg-ghost"),
        ],

        link: [
          "bg-transparent text-foreground",
          "hover:bg-secondary-surface",
          ...disabledBg("bg-button-disabled-bg-ghost"),
        ],

        "destructive-link": [
          "bg-transparent text-state-errored underline-offset-4",
          "hover:underline hover:text-state-errored-text",
          ...disabledBg("bg-button-disabled-bg-ghost"),
        ],
      },
    },
    compoundVariants: [
      // primary: semibold — appended so tailwind-merge keeps it over font-medium base
      { variant: "primary", class: "font-semibold" },
    ],
    defaultVariants: {
      variant: "primary",
    },
  }
)

// ── Loading spinner ───────────────────────────────────────────────────────────
// Smallest possible inline SVG; no separate Spinner component exists in @repo/ui.
// motion-safe:animate-spin respects prefers-reduced-motion.
// aria-hidden — spinner is decorative; aria-busy on the button root carries the signal.
const SpinnerIcon = () => (
  <svg
    aria-hidden="true"
    className="size-4 motion-safe:animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
)

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /**
   * Renders a spinner in place of label content, sets aria-disabled + aria-busy,
   * and suppresses onClick. The button stays focusable so screen readers can
   * announce the busy state. Does NOT apply the disabled visual treatment —
   * loading is "busy but valid", not "invalid".
   */
  loading?: boolean
}

// ── Component ─────────────────────────────────────────────────────────────────

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      asChild = false,
      loading = false,
      onClick,
      "aria-disabled": ariaDiabledProp,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot.Root : "button"

    // Treat both loading and caller-supplied aria-disabled as "focusable disabled".
    // When true: native disabled is NOT set, button stays in tab order.
    const isAriaDisabled = loading || ariaDiabledProp === true || ariaDiabledProp === "true"

    // Suppress click when aria-disabled or loading. Native disabled blocks clicks
    // at the browser level; aria-disabled does not, so we must suppress manually.
    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (isAriaDisabled) {
          e.preventDefault()
          return
        }
        onClick?.(e)
      },
      [isAriaDisabled, onClick]
    )

    return (
      <Comp
        ref={ref}
        data-slot="button"
        data-variant={variant}
        data-loading={loading ? "true" : undefined}
        aria-disabled={isAriaDisabled ? true : undefined}
        aria-busy={loading ? true : undefined}
        className={cn(buttonVariants({ variant, className }))}
        onClick={handleClick}
        {...props}
      >
        {loading ? <SpinnerIcon /> : children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
