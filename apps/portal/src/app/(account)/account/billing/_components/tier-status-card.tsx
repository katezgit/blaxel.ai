"use client";

import { Badge } from "@repo/ui/components/badge";
import { useAccountState } from "@/lib/mock/account-context";
import OverviewCard from "./overview-card";
import { tierProgressFor } from "./tier-progression";

export default function TierStatusCard() {
  const { state } = useAccountState();
  const progress = tierProgressFor(state.tier);
  return (
    <OverviewCard
      title="Tier status"
      primaryCta={{
        label: "View tier & quotas",
        href: "/account/billing/plan",
      }}
    >
      <div className="flex items-center gap-2">
        <Badge variant="neutral">Tier {state.tier}</Badge>
        <span className="text-caption text-muted-foreground">
          {progress.reason}
        </span>
      </div>
      <dl className="grid grid-cols-[140px_minmax(0,1fr)] gap-x-4 gap-y-1 text-body">
        <dt className="text-muted-foreground">Next tier</dt>
        <dd className="text-foreground">
          {progress.nextTier !== null ? `Tier ${progress.nextTier}` : "Max tier reached"}
        </dd>
        <dt className="text-muted-foreground">Requires</dt>
        <dd className="text-foreground">
          {progress.nextRequirement ?? "Contact sales for higher tiers."}
        </dd>
      </dl>
    </OverviewCard>
  );
}
