"use client";

import type { SelectableTier } from "@/lib/mock/billing-tiers";

interface TierContextBannerProps {
  targetTier: SelectableTier;
  amountUsd: number;
  cadence: "monthly" | "one-time";
}

// One-line context strip shown at the top of step 2 — the tier is locked by
// then, so the user just needs a reminder of what they picked while they
// configure balance protection. Replaces the right-rail About-Tier panel.
export default function TierContextBanner({
  targetTier,
  amountUsd,
  cadence,
}: TierContextBannerProps) {
  return (
    <p
      role="status"
      aria-label={`Selected Tier ${targetTier} · $${amountUsd} ${cadence === "monthly" ? "per month" : "one-time"}`}
      className="flex flex-wrap items-baseline gap-x-2 gap-y-1 typography-body"
    >
      <span className="inline-flex items-center rounded-md border border-primary-border bg-primary-soft px-2 py-0.5 font-mono typography-body font-semibold text-primary">
        Tier {targetTier}
      </span>
      <span className="text-muted-foreground">
        ${amountUsd.toLocaleString()}
        {cadence === "monthly" ? " / mo · auto-renews every 30 days" : " · one-time charge"}
      </span>
    </p>
  );
}
