import type { Meta, StoryObj } from "@storybook/react"
import { Plus, RefreshCw, Search, Trash2, X } from "lucide-react"
import { Button } from "./button"
import { IconButton } from "./icon-button"
import { Input } from "./input"

/* ─── Meta ─────────────────────────────────────────────────────────────────── */

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: { layout: "padded" },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "ghost",
        "destructive",
        "destructive-ghost",
      ],
    },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
    asChild: { control: "boolean" },
    children: { control: "text" },
  },
  args: {
    children: "Button",
    variant: "primary",
    disabled: false,
    loading: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

/* ─── Playground ───────────────────────────────────────────────────────────── */

export const Playground: Story = {}

/* ─── AllVariantsMatrix ─────────────────────────────────────────────────────── */
// Rows = variants, columns = states (enabled / disabled / aria-disabled / loading).
// Lets the operator verify every intersection in one view.

const ALL_VARIANTS = [
  "primary",
  "secondary",
  "ghost",
  "destructive",
  "destructive-ghost",
] as const

type ButtonVariant = (typeof ALL_VARIANTS)[number]

const VARIANT_LABEL: Record<ButtonVariant, string> = {
  primary: "Primary",
  secondary: "Secondary",
  ghost: "Ghost",
  destructive: "Destructive",
  "destructive-ghost": "Destr. Ghost",
}

export const AllVariantsMatrix: Story = {
  name: "All Variants × States",
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex flex-col gap-2">
      {/* Column headers */}
      <div className="grid grid-cols-[120px_1fr_1fr_1fr_1fr] gap-3 items-center">
        <span />
        {(["Enabled", "Disabled", "aria-disabled (focusable)", "Loading"] as const).map((col) => (
          <span key={col} className="typography-label text-muted-foreground text-center">
            {col}
          </span>
        ))}
      </div>

      {/* Row separator */}
      <div className="h-px bg-border" />

      {ALL_VARIANTS.map((variant) => (
        <div
          key={variant}
          className="grid grid-cols-[120px_1fr_1fr_1fr_1fr] gap-3 items-center py-1"
        >
          <span className="typography-label text-muted-foreground font-mono">
            {VARIANT_LABEL[variant]}
          </span>

          {/* Enabled */}
          <div className="flex justify-center">
            <Button variant={variant}>{VARIANT_LABEL[variant]}</Button>
          </div>

          {/* Native disabled — non-focusable, CSS :disabled */}
          <div className="flex justify-center">
            <Button variant={variant} disabled>
              {VARIANT_LABEL[variant]}
            </Button>
          </div>

          {/* aria-disabled — focusable, onClick suppressed, same visual as disabled */}
          <div className="flex justify-center">
            <Button variant={variant} aria-disabled>
              {VARIANT_LABEL[variant]}
            </Button>
          </div>

          {/* Loading — spinner, aria-disabled + aria-busy, no disabled styling */}
          <div className="flex justify-center">
            <Button variant={variant} loading>
              {VARIANT_LABEL[variant]}
            </Button>
          </div>
        </div>
      ))}
    </div>
  ),
}

/* ─── LoadingOverlay ────────────────────────────────────────────────────────── */
// All variants in loading state side-by-side.
// Key verification: spinner replaces label but button retains its variant colour
// (no grey disabled wash). Contrast this with the disabled column in AllVariantsMatrix.

export const LoadingOverlay: Story = {
  name: "Loading — all variants",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "Loading is `busy but valid` — the spinner replaces the label but the button keeps its variant colour. Compare visually with the Disabled column in AllVariantsMatrix to confirm no grey wash is applied.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="typography-label text-muted-foreground">
        Loading state — spinner replaces content; variant colour preserved; no disabled grey.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        {ALL_VARIANTS.map((variant) => (
          <Button key={variant} variant={variant} loading aria-label={`${VARIANT_LABEL[variant]} loading`} />
        ))}
      </div>

      {/* Side-by-side comparison: loading vs disabled for primary */}
      <div className="mt-2 flex flex-col gap-1.5">
        <p className="typography-label text-muted-foreground">
          Primary — loading (left) vs disabled (right). Loading keeps the brand fill.
        </p>
        <div className="flex items-center gap-3">
          <Button variant="primary" loading aria-label="Primary loading" />
          <Button variant="primary" disabled>
            Primary disabled
          </Button>
        </div>
      </div>

      {/* Same comparison for destructive */}
      <div className="flex flex-col gap-1.5">
        <p className="typography-label text-muted-foreground">
          Destructive — loading (left) vs disabled (right). Loading keeps the red fill.
        </p>
        <div className="flex items-center gap-3">
          <Button variant="destructive" loading aria-label="Destructive loading" />
          <Button variant="destructive" disabled>
            Destructive disabled
          </Button>
        </div>
      </div>
    </div>
  ),
}

/* ─── FocusBehavior ─────────────────────────────────────────────────────────── */
// Demonstrates the focusability difference between native disabled and aria-disabled.
// Native disabled: removed from tab order — keyboard users cannot reach it.
// aria-disabled: stays in tab order — focus ring visible; useful for tooltips and
// busy-state announcements.
//
// Operator verification: Tab through this story. You should reach the aria-disabled
// button (second one) but skip the native disabled button (first one).

export const FocusBehavior: Story = {
  name: "Focus — disabled vs aria-disabled",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: [
          "**Native `disabled`** — browser removes the element from the tab order. Keyboard users cannot reach it; no focus ring appears.",
          "",
          "**`aria-disabled` (focusable disabled)** — element stays in the tab order. Focus ring is visible. onClick is suppressed by the component. Use this when a tooltip or screen-reader announcement needs to explain *why* the action is unavailable, or when the button is in a loading state.",
          "",
          "**Tab through this story** to verify: you can focus the `aria-disabled` button (right) but the `disabled` button (left) is skipped.",
        ].join("\n"),
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-6">
      {/* Anchor button before the pair so Tab order is clear */}
      <p className="typography-label text-muted-foreground">
        Tab through the buttons below. The native-disabled button is skipped; the
        aria-disabled button receives focus and shows a focus ring.
      </p>

      <div className="flex items-start gap-6">
        <div className="flex flex-col items-center gap-2">
          <Button variant="primary" disabled>
            Native disabled
          </Button>
          <span className="typography-label text-muted-foreground text-center max-w-[140px]">
            Removed from tab order. No focus ring.
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Button variant="primary" aria-disabled>
            aria-disabled
          </Button>
          <span className="typography-label text-muted-foreground text-center max-w-[140px]">
            Stays in tab order. Focus ring visible. Click suppressed.
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Button variant="primary" loading aria-label="Loading button">
            Loading
          </Button>
          <span className="typography-label text-muted-foreground text-center max-w-[140px]">
            Loading uses aria-disabled. Focusable; spinner replaces label.
          </span>
        </div>
      </div>

      {/* A control button after to make tab order easy to verify */}
      <Button variant="secondary" className="self-start">
        Reachable control after
      </Button>
    </div>
  ),
}

/* ─── ToolbarAlignment ──────────────────────────────────────────────────────── */
// Hard alignment rule: Button (32px) + IconButton md (32px) + Input (32px) on one baseline.
// See: .intermediate/design/sizing/primitives-2026-06-08.md §C

export const ToolbarAlignment: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex flex-col gap-6">
      {/* Filter bar — all three primitives at 32px */}
      <div className="flex flex-col gap-1.5">
        <p className="typography-label text-muted-foreground">Toolbar / filter bar — Button + IconButton md + Input (all 32px)</p>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search runs…"
            leading={<Search className="size-4 shrink-0 text-muted-foreground" />}
            className="w-64"
          />
          <IconButton variant="ghost" size="md" aria-label="Refresh">
            <RefreshCw />
          </IconButton>
          <IconButton variant="ghost" size="md" aria-label="Clear filter">
            <X />
          </IconButton>
          <Button variant="primary">
            <Plus />
            New Taskset
          </Button>
        </div>
      </div>

      {/* Table row — IconButton sm (24px) inside a fake ~40px row */}
      <div className="flex flex-col gap-1.5">
        <p className="typography-label text-muted-foreground">Table cell — IconButton sm (24px) inside ~40px row</p>
        <div className="border border-border rounded-lg overflow-hidden w-96">
          {["frontier-reasoning-v1", "env-8xkp3-baseline", "rl-train-2026-06-07"].map((name) => (
            <div
              key={name}
              className="flex items-center justify-between h-10 px-3 border-b border-border last:border-b-0 hover:bg-hover-surface"
            >
              <span className="typography-body text-foreground font-mono">{name}</span>
              <div className="flex items-center gap-1">
                <IconButton variant="ghost" size="sm" aria-label={`Copy ID for ${name}`}>
                  <Search className="size-3.5" />
                </IconButton>
                <IconButton variant="destructive-ghost" size="sm" aria-label={`Delete ${name}`}>
                  <Trash2 className="size-3.5" />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
}
