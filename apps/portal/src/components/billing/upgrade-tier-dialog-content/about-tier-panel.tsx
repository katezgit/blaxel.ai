"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
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
    // p-6: spacious panel padding per spacing canon.
    // gap-6: section → section within the card (panel-internal section rhythm).
    <aside
      aria-labelledby="upgrade-about-tier-heading"
      className="flex h-fit flex-col gap-6 rounded-lg border border-border bg-muted-surface p-6"
    >
      <h3
        id="upgrade-about-tier-heading"
        className="font-mono typography-subtitle font-semibold text-foreground"
      >
        About Tier {targetTier}
      </h3>

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
        {/* gap-3: quota row → quota row (block within a section, denser than the
            16px default to keep the panel compact on the lg-grid right column). */}
        <ul className="flex flex-col gap-3">
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
    </aside>
  );
}
