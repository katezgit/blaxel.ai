"use client";

import { DollarSign } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import { Input } from "@repo/ui/components/input";
import { ONE_TIME_AMOUNT_PRESETS } from "./wizard-state";

const formatUsd = (value: number): string =>
  value >= 1000 ? `$${value.toLocaleString()}` : `$${value}`;

interface AmountPickerProps {
  /** Currently selected preset, or `null` when the Custom chip is active. */
  presetValue: number | null;
  /** Effective custom amount when Custom is active; `undefined` if unfilled. */
  customValue: number | undefined;
  /** Validation error message for the custom input, if any. */
  customError: string | undefined;
  /** Called when a preset chip is pressed. Pass `null` to switch to Custom. */
  onPresetChange: (next: number | null) => void;
  /** Called when the custom input changes. Pass `undefined` to clear. */
  onCustomChange: (next: number | undefined) => void;
}

const CUSTOM_INPUT_ID = "one-time-custom-amount";

export default function AmountPicker({
  presetValue,
  customValue,
  customError,
  onPresetChange,
  onCustomChange,
}: AmountPickerProps) {
  const isCustom = presetValue === null;

  return (
    <div className="flex flex-col gap-3">
      <div
        role="radiogroup"
        aria-label="Top-up amount"
        className="flex flex-wrap gap-2"
      >
        {ONE_TIME_AMOUNT_PRESETS.map((preset) => {
          const selected = presetValue === preset;
          return (
            <button
              key={preset}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onPresetChange(preset)}
              className={cn(
                "cursor-pointer rounded-md border px-4 py-2 font-mono typography-body tabular-nums",
                "transition-colors prop-(--motion-state-change)",
                "focus-visible:outline-none focus-visible:shadow-focus-ring",
                selected
                  ? "border-primary-border bg-primary-glow text-foreground"
                  : "border-border bg-card text-foreground hover:bg-hover-surface",
              )}
            >
              {formatUsd(preset)}
            </button>
          );
        })}
        <button
          type="button"
          role="radio"
          aria-checked={isCustom}
          aria-controls={CUSTOM_INPUT_ID}
          onClick={() => onPresetChange(null)}
          className={cn(
            "cursor-pointer rounded-md border px-4 py-2 typography-body",
            "transition-colors prop-(--motion-state-change)",
            "focus-visible:outline-none focus-visible:shadow-focus-ring",
            isCustom
              ? "border-primary-border bg-primary-glow text-foreground"
              : "border-border bg-card text-foreground hover:bg-hover-surface",
          )}
        >
          Custom
        </button>
      </div>

      {isCustom ? (
        <label
          htmlFor={CUSTOM_INPUT_ID}
          className="flex flex-col gap-1.5 typography-label sm:max-w-sm"
        >
          <span className="text-muted-foreground">Custom amount</span>
          <Input
            id={CUSTOM_INPUT_ID}
            type="number"
            inputMode="decimal"
            min="1"
            step="1"
            placeholder="Enter amount"
            value={customValue ?? ""}
            onChange={(event) => {
              const raw = event.target.value;
              if (raw === "") {
                onCustomChange(undefined);
                return;
              }
              const parsed = Number(raw);
              onCustomChange(Number.isFinite(parsed) ? parsed : undefined);
            }}
            aria-invalid={customError ? true : undefined}
            leading={<DollarSign aria-hidden="true" className="size-4" />}
          />
          {customError ? (
            <span
              role="alert"
              className="typography-caption font-medium text-state-errored-text"
            >
              {customError}
            </span>
          ) : null}
        </label>
      ) : null}
    </div>
  );
}
