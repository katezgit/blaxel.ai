"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import {
  TIER_UNLOCK_USD,
  ladderEntry,
  quotaDelta,
  type DisplayTier,
  type SelectableTier,
} from "@/lib/mock/billing-tiers";

const QUOTAS_VISIBLE = 5;

const formatQuotaValue = (value: number | null, unit?: string): string => {
  if (value === null) return "Unlimited";
  return `${value.toLocaleString()}${unit ?? ""}`;
};

const formatUsd = (value: number): string =>
  value >= 1000 ? `$${value.toLocaleString()}` : `$${value}`;

interface AboutTierPanelProps {
  targetTier: SelectableTier;
  currentTier: DisplayTier;
}

export function AboutTierPanel({ targetTier, currentTier }: AboutTierPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const entry = ladderEntry(targetTier);
  const threshold = TIER_UNLOCK_USD[targetTier];

  const visibleQuotas = expanded
    ? entry.quotas
    : entry.quotas.slice(0, QUOTAS_VISIBLE);
  const hiddenCount = entry.quotas.length - QUOTAS_VISIBLE;

  return (
    // p-5 + gap-4: tightened panel paddings to give the dialog breathing room.
    // Card fills col 2's bounded height; internal ScrollArea owns the only
    // overflow boundary so quotas + features scroll inside the card frame
    // instead of pushing the dialog body around.
    <aside
      aria-labelledby="upgrade-about-tier-heading"
      className="flex h-full min-h-0 flex-col gap-4 rounded-lg border border-border bg-muted-surface p-5"
    >
      <h3
        id="upgrade-about-tier-heading"
        className="font-mono typography-subtitle font-semibold text-foreground"
      >
        About Tier {targetTier}
      </h3>

      <ScrollArea className="-mr-3 flex-1 pr-3">
        <div className="flex flex-col gap-4">
      {/* gap-1: eyebrow → its content (single header unit). */}
      <section className="flex flex-col gap-1">
        <h4 className="font-mono typography-meta uppercase tracking-wider text-meta-foreground">
          Unlock requirement
        </h4>
        <p className="typography-body text-foreground">
          {formatUsd(threshold)}+ top-up in past 30 days to sustain.
        </p>
      </section>

      <section className="flex flex-col gap-1.5">
        <h4 className="font-mono typography-meta uppercase tracking-wider text-meta-foreground">
          Key quotas vs current tier {currentTier}
        </h4>
        {/* gap-2: quota row → quota row (denser than the 16px default to keep
            the panel compact on the lg-grid right column). */}
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
                    <span className="font-mono tabular-nums typography-caption text-state-scored-text">
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
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            className={cn(
              "inline-flex items-center gap-1 self-start rounded-sm typography-caption text-primary",
              "hover:underline focus-visible:outline-none focus-visible:shadow-focus-ring",
            )}
          >
            {expanded ? (
              <>
                <ChevronUp aria-hidden="true" className="size-3.5" />
                Show fewer
              </>
            ) : (
              <>
                <ChevronDown aria-hidden="true" className="size-3.5" />+ {hiddenCount} more
              </>
            )}
          </button>
        ) : null}
      </section>

      {entry.features.length > 0 ? (
        <section className="flex flex-col gap-1.5">
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
        </div>
      </ScrollArea>
    </aside>
  );
}
