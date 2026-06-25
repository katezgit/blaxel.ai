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
//      MUST NOT pick up disabled bg tokens (loading is "busy", not "invalid").
//      Guards: disabled:[&:not([data-loading])]:* and aria-disabled:[&:not([data-loading])]:*
//
// Selector correctness (Tailwind v4):
//   - aria-disabled: built-in modifier → generates [aria-disabled="true"] selector ✓
//   - [aria-disabled='true']: arbitrary form → generates broken :is() selector ✗ (bug)
//   - disabled: built-in modifier → :disabled pseudo-class ✓
//   - not-disabled: / not-aria-disabled: → v4.1 built-in negations for hover guard ✓
//
// Text color: disabled state does NOT change text color per new rule.
// Only bg is dimmed; text stays at variant default. This preserves variant intent
// (destructive text stays red, primary text stays white) even in the off state.
//
// Hover/active: suppressed when disabled, aria-disabled, or loading.
//   not-disabled:not-aria-disabled:[&:not([data-loading])]:hover:bg-*
//
// Ghost variants on tinted surfaces (e.g. --color-muted-surface) have a known
// disabled-readability issue — text-disabled over muted-surface is low contrast.
// Out of scope for this PR; flagged in issue #116 for a follow-up contrast audit.
// ─────────────────────────────────────────────────────────────────────────────

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
          // Hover/active only when interactive (not disabled, not aria-disabled, not loading).
          "not-disabled:not-aria-disabled:[&:not([data-loading])]:hover:bg-primary-hover",
          "not-disabled:not-aria-disabled:[&:not([data-loading])]:active:bg-primary-hover",
          // Disabled bg — desaturated primary (light: peach, dark: brown).
          "disabled:[&:not([data-loading])]:bg-button-disabled-bg-filled",
          "aria-disabled:[&:not([data-loading])]:bg-button-disabled-bg-filled",
          // Disabled text — light: variant white (no visible change). Dark: dim grey;
          // dark-brown bg under white text would otherwise read as ACTIVE primary.
          "disabled:[&:not([data-loading])]:text-button-disabled-text-primary",
          "aria-disabled:[&:not([data-loading])]:text-button-disabled-text-primary",
        ],

        secondary: [
          "border border-border bg-transparent text-foreground",
          "not-disabled:not-aria-disabled:[&:not([data-loading])]:hover:bg-secondary-surface",
          "not-disabled:not-aria-disabled:[&:not([data-loading])]:active:bg-selected-surface",
          // Ghost-family: transparent bg in all disabled paths — text dim IS the signal.
          "disabled:[&:not([data-loading])]:bg-button-disabled-bg-ghost",
          "aria-disabled:[&:not([data-loading])]:bg-button-disabled-bg-ghost",
          "disabled:[&:not([data-loading])]:text-button-disabled-text-ghost",
          "aria-disabled:[&:not([data-loading])]:text-button-disabled-text-ghost",
        ],

        ghost: [
          "bg-transparent text-foreground",
          "not-disabled:not-aria-disabled:[&:not([data-loading])]:hover:bg-hover-surface",
          "not-disabled:not-aria-disabled:[&:not([data-loading])]:active:bg-selected-surface",
          "disabled:[&:not([data-loading])]:bg-button-disabled-bg-ghost",
          "aria-disabled:[&:not([data-loading])]:bg-button-disabled-bg-ghost",
          "disabled:[&:not([data-loading])]:text-button-disabled-text-ghost",
          "aria-disabled:[&:not([data-loading])]:text-button-disabled-text-ghost",
        ],

        // Teal ring clashes on a red fill — override to destructive outline + errored glow.
        destructive: [
          "bg-destructive text-destructive-foreground",
          "not-disabled:not-aria-disabled:[&:not([data-loading])]:hover:bg-destructive-hover",
          "not-disabled:not-aria-disabled:[&:not([data-loading])]:active:bg-destructive-active",
          "disabled:[&:not([data-loading])]:bg-button-disabled-bg-filled-destructive",
          "aria-disabled:[&:not([data-loading])]:bg-button-disabled-bg-filled-destructive",
          // Disabled text — light: variant white (no visible change). Dark: dim grey
          // (same rationale as primary — tinted disabled bg under white reads active).
          "disabled:[&:not([data-loading])]:text-button-disabled-text-destructive",
          "aria-disabled:[&:not([data-loading])]:text-button-disabled-text-destructive",
          "focus-visible:outline-destructive focus-visible:shadow-focus-errored",
        ],

        "destructive-ghost": [
          "bg-transparent text-state-errored",
          "not-disabled:not-aria-disabled:[&:not([data-loading])]:hover:bg-state-errored-subtle",
          "not-disabled:not-aria-disabled:[&:not([data-loading])]:hover:text-state-errored-text",
          "not-disabled:not-aria-disabled:[&:not([data-loading])]:active:bg-state-errored-subtle",
          "disabled:[&:not([data-loading])]:bg-button-disabled-bg-ghost",
          "aria-disabled:[&:not([data-loading])]:bg-button-disabled-bg-ghost",
          "disabled:[&:not([data-loading])]:text-button-disabled-text-destructive-ghost",
          "aria-disabled:[&:not([data-loading])]:text-button-disabled-text-destructive-ghost",
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
