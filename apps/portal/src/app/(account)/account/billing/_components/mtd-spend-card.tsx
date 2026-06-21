"use client";

import { useAccountState } from "@/lib/mock/account-context";
import OverviewCard from "./overview-card";

const formatUsd = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

export default function MtdSpendCard() {
  const { state } = useAccountState();
  const { usageUsd, addonsUsd } = state.monthToDateSpendBreakdown;

  return (
    <OverviewCard
      title="Month-to-date spend"
      primaryCta={{ label: "View usage & costs", href: "/account/billing/usage" }}
    >
      <p className="font-mono text-display font-semibold tabular-nums text-foreground">
        {formatUsd(state.monthToDateSpendUsd)}
      </p>
      <dl className="grid grid-cols-[180px_minmax(0,1fr)] gap-x-4 gap-y-1 text-body">
        <dt className="text-muted-foreground">Usage &amp; resources</dt>
        <dd className="font-mono tabular-nums text-foreground">
          {formatUsd(usageUsd)}
        </dd>
        <dt className="text-muted-foreground">Add-ons &amp; extras</dt>
        <dd className="font-mono tabular-nums text-foreground">
          {formatUsd(addonsUsd)}
        </dd>
      </dl>
    </OverviewCard>
  );
}
