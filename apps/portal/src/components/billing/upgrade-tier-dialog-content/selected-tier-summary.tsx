"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import {
  TIER_UNLOCK_USD,
  ladderEntry,
  quotaDelta,
  type DisplayTier,
  type SelectableTier,
} from "@/lib/mock/billing-tiers";

const QUOTAS_INLINE = 4;

const formatQuotaValue = (value: number | null, unit?: string): string => {
  if (value === null) return "Unlimited";
  return `${value.toLocaleString()}${unit ?? ""}`;
};

const formatUsd = (value: number): string =>
  value >= 1000 ? `$${value.toLocaleString()}` : `$${value}`;

interface SelectedTierSummaryProps {
  targetTier: SelectableTier;
  currentTier: DisplayTier;
}

// Compact horizontal summary under the tier grid on step 1. Replaces the
// right-rail About-Tier panel — surfaces unlock requirement + four quotas
// inline; the rest tucks behind a disclosure that auto-scrolls into view so
// users don't lose the new content below the ScrollArea fold.
export default function SelectedTierSummary({ targetTier, currentTier }: SelectedTierSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const entry = ladderEntry(targetTier);
  const threshold = TIER_UNLOCK_USD[targetTier];

  const inlineQuotas = entry.quotas.slice(0, QUOTAS_INLINE);
  const remainingQuotas = entry.quotas.slice(QUOTAS_INLINE);
  const hasMore = remainingQuotas.length > 0 || entry.features.length > 0;

  // Auto-scroll the newly-revealed details into the visible scroll viewport.
  // Without this, expanded content lands below the ScrollArea fold and the
  // auto-hide scrollbar gives no affordance — reads as "nothing happened."
  useEffect(() => {
    if (!expanded) return;
    detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [expanded]);

  return (
    <section
      aria-labelledby="selected-tier-summary-heading"
      className="flex flex-col gap-3"
    >
      <header className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h3
          id="selected-tier-summary-heading"
          className="font-mono typography-body font-semibold text-foreground"
        >
          About Tier {targetTier}
        </h3>
        <p className="typography-caption text-muted-foreground">
          {formatUsd(threshold)}+ top-up in past 30 days sustains it · current Tier {currentTier}
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-x-4 gap-y-2 typography-body sm:grid-cols-2">
        {inlineQuotas.map((quota) => {
          const delta = quotaDelta(quota.id, currentTier, targetTier);
          return (
            <li key={quota.id} className="flex items-baseline gap-1.5">
              <span className="text-muted-foreground">{quota.label}</span>
              <span className="font-mono tabular-nums text-foreground">
                {formatQuotaValue(quota.value, quota.unit)}
              </span>
              {delta !== null && delta > 0 ? (
                <span className="font-mono tabular-nums typography-caption text-state-scored-text">
                  +{delta.toLocaleString()}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>

      {hasMore ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1 self-start rounded-sm typography-caption text-primary",
            "hover:underline focus-visible:outline-none focus-visible:shadow-focus-ring",
          )}
        >
          {expanded ? (
            <ChevronUp aria-hidden="true" className="size-3.5" />
          ) : (
            <ChevronDown aria-hidden="true" className="size-3.5" />
          )}
          {expanded
            ? "Hide details"
            : `Show ${remainingQuotas.length} more quotas · ${entry.features.length} features`}
        </button>
      ) : null}

      {expanded ? (
        <div ref={detailsRef} className="flex flex-col gap-3">
          {remainingQuotas.length > 0 ? (
            <ul className="grid grid-cols-1 gap-x-4 gap-y-2 typography-body sm:grid-cols-2">
              {remainingQuotas.map((quota) => {
                const delta = quotaDelta(quota.id, currentTier, targetTier);
                return (
                  <li key={quota.id} className="flex items-baseline gap-1.5">
                    <span className="text-muted-foreground">{quota.label}</span>
                    <span className="font-mono tabular-nums text-foreground">
                      {formatQuotaValue(quota.value, quota.unit)}
                    </span>
                    {delta !== null && delta > 0 ? (
                      <span className="font-mono tabular-nums typography-caption text-state-scored-text">
                        +{delta.toLocaleString()}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : null}
          {entry.features.length > 0 ? (
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
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
