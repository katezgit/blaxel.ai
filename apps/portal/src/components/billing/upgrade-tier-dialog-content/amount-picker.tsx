"use client";

import { DollarSign } from "lucide-react";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { cn } from "@repo/ui/lib/cn";
import { Input } from "@repo/ui/components/input";
import { ONE_TIME_AMOUNT_PRESETS } from "./wizard-state";

const formatUsd = (value: number): string =>
  value >= 1000 ? `$${value.toLocaleString()}` : `$${value}`;

const CUSTOM_RADIO_VALUE = "__custom__";
const CUSTOM_INPUT_ID = "one-time-custom-amount";

/**
 * Picker value shape. `preset: null` + a numeric `custom` means the Custom
 * chip is active. Either field populated yields a usable amount.
 */
export interface AmountPickerValue {
  preset: number | null;
  custom: number | undefined;
}

interface AmountPickerProps {
  value: AmountPickerValue;
  onChange: (next: AmountPickerValue) => void;
  /** Validation error for the custom input, if any. */
  error: string | undefined;
}

export default function AmountPicker({ value, onChange, error }: AmountPickerProps) {
  const isCustom = value.preset === null;
  const radioValue = isCustom ? CUSTOM_RADIO_VALUE : String(value.preset);

  const handleRadioChange = (next: string) => {
    if (next === CUSTOM_RADIO_VALUE) {
      onChange({ preset: null, custom: value.custom });
      return;
    }
    onChange({ preset: Number(next), custom: undefined });
  };

  return (
    <div className="flex flex-col gap-3">
      <RadioGroup.Root
        value={radioValue}
        onValueChange={handleRadioChange}
        aria-label="Top-up amount"
        className="flex flex-wrap gap-2"
      >
        {ONE_TIME_AMOUNT_PRESETS.map((preset) => (
          <ChipRadio
            key={preset}
            value={String(preset)}
            selected={value.preset === preset}
            className="font-mono tabular-nums"
          >
            {formatUsd(preset)}
          </ChipRadio>
        ))}
        <ChipRadio
          value={CUSTOM_RADIO_VALUE}
          selected={isCustom}
          aria-controls={CUSTOM_INPUT_ID}
        >
          Custom
        </ChipRadio>
      </RadioGroup.Root>

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
            value={value.custom ?? ""}
            onChange={(event) => {
              const raw = event.target.value;
              if (raw === "") {
                onChange({ preset: null, custom: undefined });
                return;
              }
              const parsed = Number(raw);
              onChange({
                preset: null,
                custom: Number.isFinite(parsed) ? parsed : undefined,
              });
            }}
            aria-invalid={error ? true : undefined}
            leading={<DollarSign aria-hidden="true" className="size-4" />}
          />
          {error ? (
            <span role="alert" className="typography-caption text-state-errored-text">
              {error}
            </span>
          ) : null}
        </label>
      ) : null}
    </div>
  );
}

interface ChipRadioProps {
  value: string;
  selected: boolean;
  children: React.ReactNode;
  className?: string;
  "aria-controls"?: string;
}

// Radix `RadioGroup.Item` wired with the chip visual treatment. Using Radix
// (not a hand-rolled `role="radio"` div) gets us roving tabindex + arrow-key
// navigation between chips for free — only the selected chip is the Tab stop.
function ChipRadio({
  value,
  selected,
  children,
  className,
  "aria-controls": ariaControls,
}: ChipRadioProps) {
  return (
    <RadioGroup.Item
      value={value}
      aria-controls={ariaControls}
      className={cn(
        "cursor-pointer rounded-md border px-4 py-2 typography-body",
        "transition-colors duration-fast ease-out-standard",
        "focus-visible:outline-none focus-visible:shadow-focus-ring",
        selected
          ? "border-primary-border bg-primary-glow text-foreground"
          : "border-border bg-card text-foreground hover:bg-hover-surface",
        className,
      )}
    >
      {children}
    </RadioGroup.Item>
  );
}
