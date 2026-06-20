"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import type { Tier } from "@/lib/mock/account";

interface TierRow {
  tier: Tier | 4 | 5 | 6 | 7 | 8 | 9;
  requirement: string;
  keyQuotas: string;
  features: string;
}

const TIER_ROWS: ReadonlyArray<TierRow> = [
  {
    tier: 0,
    requirement: "None",
    keyQuotas: "10/10 Sandboxes, 5 Agents/MCPs/Jobs, 4 GB RAM max",
    features: "Logs 3d, 7d max sandbox runtime",
  },
  {
    tier: 1,
    requirement: "Add payment method",
    keyQuotas: "50/20 Sandboxes, 20 Agents/MCPs/Jobs, 64 GB RAM",
    features: "Volumes, Policies, Previews, Cron, Revisions, Logs 14d",
  },
  {
    tier: 2,
    requirement: "50+ credits top-up in past 3 months",
    keyQuotas: "200/75 Sandboxes, 400 Volumes / 200 GB, 128 GB RAM",
    features: "Unlimited sandbox runtime, Logs 30d",
  },
  {
    tier: 3,
    requirement: "200+ credits top-up in past 30 days",
    keyQuotas: "800/200 Sandboxes, 6,000 Volumes / 3 TB",
    features: "Custom domains",
  },
  {
    tier: 4,
    requirement: "500+ credits / 30d",
    keyQuotas: "2,000/400 Sandboxes, 18,000 Volumes / 9 TB, 512 GB RAM",
    features: "",
  },
  {
    tier: 5,
    requirement: "1,500+ credits / 30d",
    keyQuotas: "5,000/1,000 Sandboxes, 50,000 Volumes / 24 TB",
    features: "",
  },
  {
    tier: 6,
    requirement: "4,000+ credits / 30d",
    keyQuotas: "10,000/2,000 Sandboxes, 144,000 Volumes / 70 TB",
    features: "",
  },
  {
    tier: 7,
    requirement: "Contact us",
    keyQuotas: "25,000/4,000 Sandboxes, 512,000 Volumes / 250 TB",
    features: "",
  },
  {
    tier: 8,
    requirement: "Contact us",
    keyQuotas: "50,000/8,000 Sandboxes, 1,024,000 Volumes / 500 TB",
    features: "",
  },
  {
    tier: 9,
    requirement: "Contact us",
    keyQuotas: "100,000+ Sandboxes, 2,048,000+ Volumes / 1 PB+",
    features: "",
  },
];

interface TierComparisonProps {
  currentTier: Tier;
}

export function TierComparison({ currentTier }: TierComparisonProps) {
  const [open, setOpen] = useState(false);
  const panelId = "tier-comparison-panel";

  return (
    <section className="rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-fast ease-out-standard hover:bg-hover-surface focus-visible:shadow-focus-ring rounded-lg"
      >
        <span className="flex items-center gap-2 text-body font-medium text-foreground">
          {open ? (
            <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
          )}
          Compare all tiers
        </span>
        <span className="text-caption text-muted-foreground">
          {open ? "Collapse" : "Expand"}
        </span>
      </button>
      {open ? (
        <div id={panelId} className="border-t border-border">
          <table className="w-full border-collapse text-body">
            <caption className="sr-only">Tier comparison</caption>
            <thead>
              <tr className="border-b border-border bg-muted-surface">
                <th
                  scope="col"
                  className="px-4 py-2 text-left font-mono text-meta uppercase text-meta-foreground"
                >
                  Tier
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left font-mono text-meta uppercase text-meta-foreground"
                >
                  Requirement
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left font-mono text-meta uppercase text-meta-foreground"
                >
                  Key Quotas
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left font-mono text-meta uppercase text-meta-foreground"
                >
                  Features
                </th>
              </tr>
            </thead>
            <tbody>
              {TIER_ROWS.map((row) => {
                const isCurrent = row.tier === currentTier;
                return (
                  <tr
                    key={row.tier}
                    aria-current={isCurrent ? "true" : undefined}
                    className={cn(
                      "border-b border-border last:border-b-0",
                      isCurrent && "bg-selected-surface",
                    )}
                  >
                    <td className="px-4 py-2 align-top">
                      <span className="font-mono text-body tabular-nums text-foreground">
                        Tier {row.tier}
                      </span>
                      {isCurrent ? (
                        <span className="ml-2 text-caption text-primary">
                          Current tier
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2 align-top text-foreground">
                      {row.requirement}
                    </td>
                    <td className="px-4 py-2 align-top text-foreground">
                      {row.keyQuotas}
                    </td>
                    <td className="px-4 py-2 align-top text-foreground">
                      {row.features || <span className="text-muted-foreground">&mdash;</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="border-t border-border px-4 py-3 text-caption text-muted-foreground">
            About to launch and expect a temporary spike?{" "}
            <a
              href="mailto:sales@blaxel.ai"
              className="font-medium text-primary hover:underline focus-visible:shadow-focus-ring rounded-sm"
            >
              Contact us
            </a>
          </p>
        </div>
      ) : null}
    </section>
  );
}
