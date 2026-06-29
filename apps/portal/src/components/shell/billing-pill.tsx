"use client";

import Link from "next/link";
import { buttonVariants } from "@repo/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import { useAccountState } from "@/lib/mock/account-context";

/**
 * Topbar tier-and-balance shortcut. Tier is the load-bearing signal; links to
 * Tier & quotas (the surface that explains tier mechanics and how to move up).
 * Credits live one click away under the same Billing section.
 */
export default function BillingPill() {
  const { state } = useAccountState();
  const hasBalance = Number.isFinite(state.balanceUsd);
  const balanceLabel = hasBalance ? `$${state.balanceUsd.toFixed(2)}` : "$—";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href="/account/billing/tier-quotas"
          aria-label={`Tier ${state.tier} · View tier and quotas`}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "text-muted-foreground hover:text-foreground",
          )}
        >
          Tier {state.tier}
          <span aria-hidden="true" className="text-meta-foreground">
            &middot;
          </span>
          <span className="tabular-nums">{balanceLabel}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent>Tier &amp; quotas</TooltipContent>
    </Tooltip>
  );
}
