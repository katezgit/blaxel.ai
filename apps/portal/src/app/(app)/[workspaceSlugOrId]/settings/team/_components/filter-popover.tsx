"use client";

import { ChevronDown, ListFilter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/cn";

interface FilterPopoverProps<T extends string> {
  label: string;
  options: ReadonlyArray<T>;
  optionLabel: (value: T) => string;
  selected: ReadonlySet<T>;
  onChange: (next: ReadonlySet<T>) => void;
  counts: Record<T, number>;
}

/**
 * Multi-select filter dropdown — checkbox list with per-option counts.
 * Wraps `Popover` + `Checkbox` rather than `MultiSelect` because the trigger
 * here is a labeled filter chip, not a value-display input.
 */
export function FilterPopover<T extends string>({
  label,
  options,
  optionLabel,
  selected,
  onChange,
  counts,
}: FilterPopoverProps<T>) {
  const selectedCount = selected.size;

  const toggle = (value: T) => {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange(next);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-label text-foreground",
            "hover:bg-secondary-surface focus-visible:shadow-focus-ring",
          )}
        >
          <ListFilter aria-hidden="true" className="size-3.5 text-meta-foreground" />
          <span>{label}</span>
          {selectedCount > 0 && (
            <span className="font-mono text-meta text-meta-foreground">
              {selectedCount}
            </span>
          )}
          <ChevronDown aria-hidden="true" className="size-3.5 text-meta-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1.5">
        <ul className="flex flex-col gap-0.5">
          {options.map((option) => {
            const checked = selected.has(option);
            return (
              <li key={option}>
                <label className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-label text-foreground hover:bg-secondary-surface">
                  <Checkbox
                    size="sm"
                    checked={checked}
                    onCheckedChange={() => toggle(option)}
                  />
                  <span className="flex-1 truncate">{optionLabel(option)}</span>
                  <span className="font-mono text-meta text-meta-foreground tabular-nums">
                    {counts[option] ?? 0}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        {selectedCount > 0 && (
          <div className="mt-1.5 flex justify-end border-t border-border pt-1.5">
            <Button
              variant="ghost"
              onClick={() => onChange(new Set())}
              className="h-7"
            >
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
