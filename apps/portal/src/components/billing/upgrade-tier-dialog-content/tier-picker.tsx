"use client";

import { CircleDollarSign } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import { Badge } from "@repo/ui/components/badge";
import {
  SELECTABLE_TIERS,
  TIER_SUGGESTED_MONTHLY_USD,
  TIER_UNLOCK_USD,
  type SelectableTier,
} from "@/lib/mock/billing-tiers";

const formatUsd = (value: number): string =>
  value >= 1000 ? `$${value.toLocaleString()}` : `$${value}`;

interface TierPickerProps {
  /** Currently selected tier (as a string for form parity). */
  value: `${SelectableTier}`;
  onChange: (next: `${SelectableTier}`) => void;
  /** Tier that should display the `Recommended` badge. Defaults to 1. */
  recommendedTier?: SelectableTier;
}

export default function TierPicker({
  value,
  onChange,
  recommendedTier = 1,
}: TierPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Target quota tier"
      className="grid grid-cols-1 gap-2 sm:grid-cols-2"
    >
      {SELECTABLE_TIERS.map((tier) => {
        const tierKey = String(tier) as `${SelectableTier}`;
        const selected = value === tierKey;
        const threshold = TIER_UNLOCK_USD[tier];
        const monthly = TIER_SUGGESTED_MONTHLY_USD[tier];
        const isRecommended = tier === recommendedTier;

        return (
          <button
            key={tier}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(tierKey)}
            className={cn(
              "group flex cursor-pointer items-center justify-between gap-4 rounded-md border px-4 py-2.5 text-left",
              "transition-colors duration-fast ease-out-standard",
              "focus-visible:outline-none focus-visible:shadow-focus-ring",
              // Recommended tile gets the same primary ring as the Current
              // Tier row at /account/billing/tier-quotas so the "lead
              // choice" signal reinforces the Recommended badge. Selected
              // state wins (filled glow) — the unselected-recommended ring
              // only matters before the user picks.
              selected && "border-primary-border bg-primary-glow",
              !selected && isRecommended && "border-primary bg-card hover:bg-hover-surface",
              !selected && !isRecommended && "border-border bg-card hover:bg-hover-surface",
            )}
          >
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="flex items-center gap-2">
                <span className="font-mono typography-body font-semibold text-foreground">
                  Tier {tier}
                </span>
                {isRecommended ? (
                  <Badge variant="brand-soft" size="sm">
                    Recommended
                  </Badge>
                ) : null}
              </span>
              <span className="typography-caption text-muted-foreground">
                {formatUsd(threshold)}+ top-up in past 30 days
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5 font-mono tabular-nums typography-body text-foreground">
              <CircleDollarSign
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              +{formatUsd(monthly)} / mo
            </span>
          </button>
        );
      })}
    </div>
  );
}
