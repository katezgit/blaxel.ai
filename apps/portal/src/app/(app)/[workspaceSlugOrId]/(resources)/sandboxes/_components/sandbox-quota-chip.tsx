// Sandbox quota chip — non-clickable ambient info shown below the h1 per
// sandboxes-list-2026-07-01 wireframe §1.1. Count turns warning when less
// than 20% of tier quota remains. Renders `Sandbox · N remaining in Tier N`.
//
// Deliberately non-clickable: this surface is a capacity read at glance-
// scale, not an entry point to the billing surface. Audit question #3 flags
// this for operator confirmation.

import { cn } from "@repo/ui/lib/cn";

interface SandboxQuotaChipProps {
  remaining: number;
  tier: number;
  quotaCap: number;
}

export function SandboxQuotaChip({
  remaining,
  tier,
  quotaCap,
}: SandboxQuotaChipProps) {
  const fraction = quotaCap > 0 ? remaining / quotaCap : 1;
  const isLow = fraction < 0.2;
  return (
    <p className="typography-meta text-meta-foreground">
      Sandbox ·{" "}
      <span
        className={cn(
          "tabular-nums font-medium",
          isLow ? "text-state-warning-text" : "text-foreground",
        )}
      >
        {remaining.toLocaleString("en-US")} remaining
      </span>{" "}
      in Tier {tier}
    </p>
  );
}
