"use client"

// shadcn-source: https://ui.shadcn.com/docs/components/button (cli, 2026-05-26)
// Client boundary: Button forwards a synthesized `onClick` to its rendered
// element, so server components that render <Button> would otherwise crash
// RSC serialization with "Event handlers cannot be passed to Client Component
// props".
import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/ui/lib/cn"
import { buttonBaseClasses } from "./button-base"

// Disabled has three paths: native :disabled (browser blocks click + focus),
// aria-disabled="true" (focusable, click suppressed in handleClick), and loading
// (aria-disabled + data-loading, click suppressed, keeps variant bg — Mantine
// /Primer "busy ≠ off" pattern). Bg/text/cursor selectors all guard with
// :not([data-loading]) so loading doesn't pick up the disabled visual.
// Tailwind v4: use the built-in `aria-disabled:` modifier — the arbitrary
// `[aria-disabled='true']:` form compiles to a broken `:is()` selector.
const buttonVariants = cva(
  [
    ...buttonBaseClasses,
    "h-8 px-3.5 py-0 typography-body font-medium rounded-lg gap-2 [&_svg]:size-4",
    "transition-[background-color,color,border-color] duration-fast ease-out-standard",
  ],
  {
    variants: {
      variant: {
        primary: [
          "font-mono bg-primary text-primary-foreground",
          "not-disabled:not-aria-disabled:[&:not([data-loading])]:hover:bg-primary-hover",
          "not-disabled:not-aria-disabled:[&:not([data-loading])]:active:bg-primary-hover",
          "disabled:[&:not([data-loading])]:bg-button-disabled-bg-filled",
          "aria-disabled:[&:not([data-loading])]:bg-button-disabled-bg-filled",
          "disabled:[&:not([data-loading])]:text-button-disabled-text-primary",
          "aria-disabled:[&:not([data-loading])]:text-button-disabled-text-primary",
        ],

        secondary: [
          "border border-border bg-transparent text-foreground",
          "not-disabled:not-aria-disabled:[&:not([data-loading])]:hover:bg-hover-surface",
          "not-disabled:not-aria-disabled:[&:not([data-loading])]:active:bg-selected-surface",
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

        // Teal focus ring clashes on a red fill — override to destructive outline.
        destructive: [
          "bg-destructive text-destructive-foreground",
          "not-disabled:not-aria-disabled:[&:not([data-loading])]:hover:bg-destructive-hover",
          "not-disabled:not-aria-disabled:[&:not([data-loading])]:active:bg-destructive-active",
          "disabled:[&:not([data-loading])]:bg-button-disabled-bg-filled-destructive",
          "aria-disabled:[&:not([data-loading])]:bg-button-disabled-bg-filled-destructive",
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

// Inline spinner — no separate Spinner component exists in @repo/ui.
// motion-safe:animate-spin respects prefers-reduced-motion.
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

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /**
   * Renders a spinner instead of label, sets aria-disabled + aria-busy, and
   * suppresses onClick. The button stays focusable so screen readers can
   * announce the busy state. Does NOT apply the disabled visual — loading is
   * "busy but valid", not "invalid".
   */
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      asChild = false,
      loading = false,
      onClick,
      "aria-disabled": ariaDisabledProp,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot.Root : "button"

    // Loading + caller-supplied aria-disabled both render as "focusable disabled":
    // aria-disabled is set, native disabled is NOT, button stays in tab order.
    const isAriaDisabled = loading || ariaDisabledProp === true || ariaDisabledProp === "true"

    // aria-disabled doesn't block clicks at the browser level (native disabled does),
    // so suppress manually.
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
