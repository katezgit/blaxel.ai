"use client";

import { useAccountState } from "@/lib/mock/account-context";
import OverviewCard from "./overview-card";

const formatUsd = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

export default function CreditBalanceCard() {
  const { state } = useAccountState();
  const lastTopUp = state.creditHistory.find((entry) => entry.type === "Top-up");
  const usedSinceTopUpUsd = lastTopUp
    ? state.creditHistory
        .filter((entry) => entry.type === "Usage" && entry.date >= lastTopUp.date)
        .reduce((sum, entry) => sum + Math.abs(entry.amount), 0)
    : 0;

  return (
    <OverviewCard
      title="Credit balance"
      primaryCta={{ label: "Add credits", href: "/account/billing/credits" }}
      secondaryCta={{
        label: "Configure auto top-up",
        href: "/account/billing/credits#auto-top-up",
      }}
    >
      <p className="font-mono text-display font-semibold tabular-nums text-foreground">
        {formatUsd(state.balanceUsd)}
      </p>
      <p className="text-body text-muted-foreground">
        Used since last top-up:{" "}
        <span className="font-mono tabular-nums text-foreground">
          {formatUsd(usedSinceTopUpUsd)}
        </span>
      </p>
    </OverviewCard>
  );
}
