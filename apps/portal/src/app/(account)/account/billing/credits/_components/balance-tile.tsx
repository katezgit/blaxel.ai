"use client";

import { ArrowRight, Gift } from "lucide-react";
import type { AccountState } from "@/lib/mock/account";

const formatBalance = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

interface BalanceTileProps {
  state: AccountState;
}

export function BalanceTile({ state }: BalanceTileProps) {
  const autoTopUpStatus = state.autoTopUp.enabled
    ? `Auto top-up: ON — tops up at $${state.autoTopUp.thresholdUsd}`
    : "Auto top-up: OFF";

  return (
    <section
      id="balance"
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6"
    >
      <h2 className="text-caption text-muted-foreground">Credit balance</h2>
      <p className="font-mono text-display font-semibold tabular-nums text-foreground">
        {formatBalance(state.balanceUsd)}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-secondary-surface px-2 text-caption text-foreground">
          {autoTopUpStatus}
        </span>
        <a
          href="#auto-top-up"
          className="inline-flex items-center gap-0.5 text-caption text-muted-foreground hover:text-foreground hover:underline focus-visible:shadow-focus-ring rounded-sm"
        >
          Configure in Top-up &amp; alerts below
          <ArrowRight className="size-3" aria-hidden="true" />
        </a>
      </div>
      <a
        href="#earn-credits"
        className="inline-flex items-center gap-1 text-body font-medium text-primary hover:underline focus-visible:shadow-focus-ring rounded-sm"
      >
        <Gift className="size-4" aria-hidden="true" />
        Earn free credits &mdash; {state.earnCreditsRemaining} tasks available
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </a>
    </section>
  );
}
