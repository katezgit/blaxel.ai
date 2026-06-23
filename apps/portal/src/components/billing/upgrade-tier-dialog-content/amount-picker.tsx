"use client";

import { DollarSign } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import { Input } from "@repo/ui/components/input";
import { TOP_UP_AMOUNT_OPTIONS } from "@/lib/mock/billing-tiers";

const PRESET_VALUES = TOP_UP_AMOUNT_OPTIONS.map((n) => String(n));

const formatPresetLabel = (n: number): string =>
  n >= 1000 ? `$${n.toLocaleString()}` : `$${n}`;

interface AmountPickerProps {
  /** Selected preset (`"100"`, `"200"`, …) or `"custom"`. */
  selection: string;
  onSelectionChange: (next: string) => void;
  customAmount: string;
  onCustomAmountChange: (next: string) => void;
  /** Inline error rendered under the custom input when set. */
  customAmountError?: string;
}

export function AmountPicker({
  selection,
  onSelectionChange,
  customAmount,
  onCustomAmountChange,
  customAmountError,
}: AmountPickerProps) {
  const isCustom = selection === "custom";

  return (
    <div className="flex flex-col gap-3">
      <div role="radiogroup" aria-label="Amount to top up" className="grid grid-cols-5 gap-2">
        {PRESET_VALUES.map((value) => {
          const active = selection === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelectionChange(value)}
              className={cn(
                "h-9 rounded-md border typography-body font-medium",
                "transition-colors prop-(--motion-state-change)",
                active
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-form-field-border bg-card text-foreground hover:bg-hover-surface",
                "focus-visible:outline-none focus-visible:shadow-focus-ring",
              )}
            >
              {formatPresetLabel(Number(value))}
            </button>
          );
        })}
        <button
          type="button"
          role="radio"
          aria-checked={isCustom}
          onClick={() => onSelectionChange("custom")}
          className={cn(
            "h-9 rounded-md border typography-body font-medium",
            "transition-colors prop-(--motion-state-change)",
            isCustom
              ? "border-primary bg-primary-soft text-primary"
              : "border-form-field-border bg-card text-foreground hover:bg-hover-surface",
            "focus-visible:outline-none focus-visible:shadow-focus-ring",
          )}
        >
          Custom
        </button>
      </div>
      {isCustom ? (
        <div className="flex flex-col gap-1.5">
          <Input
            type="number"
            inputMode="decimal"
            min="1"
            step="1"
            aria-label="Custom amount in USD"
            aria-invalid={customAmountError ? true : undefined}
            value={customAmount}
            onChange={(event) => onCustomAmountChange(event.target.value)}
            leading={<DollarSign aria-hidden="true" className="size-4" />}
            placeholder="Enter amount"
          />
          {customAmountError ? (
            <span
              role="alert"
              className="typography-caption font-medium text-state-errored-text"
            >
              {customAmountError}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
