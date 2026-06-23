"use client";

import { Check } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import {
  TIER_UNLOCK_USD,
  ladderEntry,
  quotaDelta,
  type DisplayTier,
} from "@/lib/mock/billing-tiers";

const QUOTAS_VISIBLE = 5;

const formatQuotaValue = (value: number | null, unit?: string): string => {
  if (value === null) return "Unlimited";
  return `${value.toLocaleString()}${unit ?? ""}`;
};

interface AboutTierPanelProps {
  targetTier: DisplayTier;
  currentTier: DisplayTier;
}

export function AboutTierPanel({ targetTier, currentTier }: AboutTierPanelProps) {
  const entry = ladderEntry(targetTier);
  const threshold = TIER_UNLOCK_USD[targetTier];

  const visibleQuotas = entry.quotas.slice(0, QUOTAS_VISIBLE);
  const hiddenCount = entry.quotas.length - visibleQuotas.length;

  return (
    <aside
      aria-labelledby="upgrade-about-tier-heading"
      className="flex h-fit flex-col gap-4 rounded-lg border border-border bg-muted-surface p-4"
    >
      <h3
        id="upgrade-about-tier-heading"
        className="typography-subtitle font-semibold text-foreground"
      >
        About Tier {targetTier}
      </h3>

      <section className="flex flex-col gap-1.5">
        <h4 className="font-mono typography-meta uppercase tracking-wider text-meta-foreground">
          Unlock requirement
        </h4>
        <p className="typography-body text-foreground">
          ${threshold}+ top-up in past 30 days to sustain.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h4 className="font-mono typography-meta uppercase tracking-wider text-meta-foreground">
          Key quotas vs current tier {currentTier}
        </h4>
        <ul className="flex flex-col gap-2">
          {visibleQuotas.map((quota) => {
            const delta = quotaDelta(quota.id, currentTier, targetTier);
            return (
              <li
                key={quota.id}
                className="flex items-baseline justify-between gap-2 typography-body"
              >
                <span className="text-muted-foreground">{quota.label}</span>
                <span className="flex items-baseline gap-2">
                  <span className="font-mono tabular-nums text-foreground">
                    {formatQuotaValue(quota.value, quota.unit)}
                  </span>
                  {delta !== null && delta > 0 ? (
                    <span
                      className={cn(
                        "font-mono tabular-nums typography-caption",
                        "text-state-scored-text",
                      )}
                    >
                      +{delta.toLocaleString()}
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
        {hiddenCount > 0 ? (
          <button
            type="button"
            className="self-start typography-caption text-primary hover:underline"
          >
            + {hiddenCount} more
          </button>
        ) : null}
      </section>

      {entry.features.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h4 className="font-mono typography-meta uppercase tracking-wider text-meta-foreground">
            Features unlocked
          </h4>
          <ul className="flex flex-col gap-1.5">
            {entry.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 typography-body text-foreground"
              >
                <Check
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-state-scored"
                />
                {feature}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}
