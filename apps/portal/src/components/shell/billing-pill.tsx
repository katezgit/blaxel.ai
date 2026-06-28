"use client";

import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useAccountState } from "@/lib/mock/account-context";

/**
 * Links to /account/billing/credits (not /account/billing/tier-quotas) —
 * this is a billing shortcut, not a tier badge.
 */
export default function BillingPill() {
  const { state } = useAccountState();
  const hasBalance = Number.isFinite(state.balanceUsd);
  const balanceLabel = hasBalance ? `$${state.balanceUsd.toFixed(2)}` : "$—";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          asChild
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
        >
          <Link
            href="/account/billing/credits"
            aria-label={`Tier ${state.tier} · Open Billing`}
          >
            Tier {state.tier}
            <span aria-hidden="true" className="text-meta-foreground">
              &middot;
            </span>
            <span className="tabular-nums">{balanceLabel}</span>
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Credits &amp; top-ups</TooltipContent>
    </Tooltip>
  );
}
