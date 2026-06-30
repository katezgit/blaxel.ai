"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/popover";
import {
  ALL_STATUS_FILTERS,
  statusToneClasses,
  type StatusFilterLabel,
} from "./aggregate-data";

// Vercel-style multi-select Status filter — single button trigger with
// stacked color-dot aggregate + "Status N/M" label, popover surface with
// one checkbox row per status (color dot + label).
//
// Replaces the previous toolbar's three state chips + "Include terminated"
// chip. Terminated / Inactive are now opt-in checkboxes inside this dropdown
// rather than a separate toggle.

const MAX_STACKED_DOTS = 4;

interface StatusFilterMenuProps {
  value: ReadonlyArray<StatusFilterLabel>;
  onChange: (next: ReadonlyArray<StatusFilterLabel>) => void;
}

export function StatusFilterMenu({ value, onChange }: StatusFilterMenuProps) {
  const [open, setOpen] = useState(false);
  const selectedCount = value.length;
  const totalCount = ALL_STATUS_FILTERS.length;

  // Preserve canonical order in the aggregate dots so dot stacking is stable
  // across selection changes (no shuffle when toggling a middle status).
  const orderedSelection = ALL_STATUS_FILTERS.filter((label) =>
    value.includes(label),
  );
  const visibleDots = orderedSelection.slice(0, MAX_STACKED_DOTS);
  const overflowDots = orderedSelection.length - visibleDots.length;

  function toggle(label: StatusFilterLabel) {
    if (value.includes(label)) {
      onChange(value.filter((v) => v !== label));
    } else {
      // Re-sort into canonical order so the active set is stable regardless
      // of click order — the strip's "is exactly Errored isolated" check
      // depends on order-independent equality, and ordered values keep render
      // diffs minimal.
      const next = new Set([...value, label]);
      onChange(ALL_STATUS_FILTERS.filter((l) => next.has(l)));
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Filter by status, ${selectedCount} of ${totalCount} selected`}
          data-state={open ? "open" : "closed"}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card pl-2 pr-2",
            "typography-body text-foreground",
            "transition-colors duration-fast ease-out-standard",
            "hover:bg-muted-surface",
            "focus-visible:outline-none focus-visible:shadow-focus-ring",
            "data-[state=open]:shadow-focus-ring",
          )}
        >
          <StackedDots labels={visibleDots} overflow={overflowDots} />
          <span className="typography-body text-foreground">
            Status{" "}
            <span className="tabular-nums text-muted-foreground">
              {selectedCount}/{totalCount}
            </span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        variant="action"
        align="end"
        className="w-56"
      >
        <ul role="group" aria-label="Sandbox status filter">
          {ALL_STATUS_FILTERS.map((label) => (
            <StatusRow
              key={label}
              label={label}
              checked={value.includes(label)}
              onToggle={() => toggle(label)}
            />
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function StatusRow({
  label,
  checked,
  onToggle,
}: {
  label: StatusFilterLabel;
  checked: boolean;
  onToggle: () => void;
}) {
  const tone = statusToneClasses(label);
  // Row is a <div> with a click handler — the Checkbox primitive is itself a
  // <button> (Radix), so the row container cannot also be a button. A label
  // wouldn't propagate clicks to a button child either. Click anywhere in
  // the row toggles the state, but the Checkbox stays the single keyboard /
  // a11y target.
  function handleRowClick(event: React.MouseEvent<HTMLDivElement>) {
    // The Checkbox itself bubbles its onCheckedChange; only handle clicks
    // outside it (label text, dot, padding) here.
    if ((event.target as HTMLElement).closest("[data-slot=checkbox]")) return;
    onToggle();
  }
  return (
    <li>
      <div
        onClick={handleRowClick}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5",
          "typography-body text-foreground",
          "hover:bg-muted-surface",
          "has-[[data-slot=checkbox]:focus-visible]:bg-muted-surface",
          "transition-colors duration-fast ease-out-standard",
        )}
      >
        <Checkbox
          checked={checked}
          onCheckedChange={onToggle}
          size="sm"
          aria-label={label}
        />
        <span
          aria-hidden="true"
          className={cn("size-2 shrink-0 rounded-full", tone.dot)}
        />
        <span className="flex-1 select-none text-left">{label}</span>
      </div>
    </li>
  );
}

function StackedDots({
  labels,
  overflow,
}: {
  labels: ReadonlyArray<StatusFilterLabel>;
  overflow: number;
}) {
  // Stacked color-dot aggregate — top N selected statuses overlapping by 4px
  // on the leading edge of the button. Matches the Vercel reference pattern.
  // Dots use the same state color tokens as the row pills + Status dropdown
  // rows so the same status reads the same color everywhere.
  if (labels.length === 0) {
    return (
      <span
        aria-hidden="true"
        className="inline-flex items-center justify-center"
      >
        <span className="size-2.5 rounded-full border border-dashed border-border-strong" />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center"
    >
      {labels.map((label, index) => {
        const tone = statusToneClasses(label);
        return (
          <span
            key={label}
            className={cn(
              "size-2.5 rounded-full ring-2 ring-card",
              tone.dot,
              index > 0 && "-ml-1.5",
            )}
          />
        );
      })}
      {overflow > 0 ? (
        <span className="typography-meta ml-1 tabular-nums text-muted-foreground">
          +{overflow}
        </span>
      ) : null}
    </span>
  );
}
