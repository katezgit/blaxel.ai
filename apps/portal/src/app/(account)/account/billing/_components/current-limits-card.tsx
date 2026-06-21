"use client";

import { TIER_LIMITS } from "@/lib/mock/account";
import { useAccountState } from "@/lib/mock/account-context";
import OverviewCard from "./overview-card";

export default function CurrentLimitsCard() {
  const { state } = useAccountState();
  const limits = TIER_LIMITS[state.tier];

  const rows: ReadonlyArray<{ label: string; value: string }> = [
    {
      label: "Sandboxes",
      value: `${limits.sandboxesTotal} total · ${limits.sandboxesConcurrent} concurrent`,
    },
    {
      label: "Agents / MCP / Jobs",
      value: `${limits.agentsMcpsJobs} max`,
    },
    {
      label: "Concurrent RAM",
      value: `${limits.concurrentRamGb} GB`,
    },
    {
      label: "Logs retention",
      value: `${limits.logsRetentionDays} days`,
    },
  ];

  return (
    <OverviewCard
      title="Current limits"
      primaryCta={{ label: "View all quotas", href: "/account/billing/plan" }}
    >
      <dl className="grid grid-cols-[160px_minmax(0,1fr)] gap-x-4 gap-y-1 text-body">
        {rows.map((row) => (
          <div key={row.label} className="contents">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </OverviewCard>
  );
}
