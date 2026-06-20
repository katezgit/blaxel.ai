"use client";

import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useAccountState } from "@/lib/mock/account-context";

/**
 * Topbar billing shortcut. Carries the tier label and live credit balance in
 * one outlined pill — re-introducing the balance to chrome after the standalone
 * BalanceChip was dropped. Click target jumps to /account/billing/credits
 * (not /account/billing/plan — the pill is a billing shortcut, not a tier
 * badge).
 */
export function BillingPill() {
  const { state } = useAccountState();
  const hasBalance = Number.isFinite(state.balanceUsd);
  const balanceLabel = hasBalance ? `$${state.balanceUsd.toFixed(2)}` : "$—";
  const ariaLabel = hasBalance
    ? `Tier ${state.tier}, $${state.balanceUsd.toFixed(2)} credits. Open Billing.`
    : `Tier ${state.tier}, credits loading. Open Billing.`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href="/account/billing/credits"
          aria-label={ariaLabel}
          className="inline-flex h-7 cursor-pointer items-center rounded-md border border-border bg-transparent px-2.5 text-label font-medium text-foreground transition-colors duration-fast ease-out-standard hover:bg-hover-surface focus-visible:shadow-focus-ring"
        >
          Tier {state.tier}
          <span aria-hidden="true" className="mx-1.5 text-meta-foreground">
            &middot;
          </span>
          <span className="tabular-nums">{balanceLabel}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent>Billing &amp; credits</TooltipContent>
    </Tooltip>
  );
}
