"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Panel } from "@/app/(manage)/_components/page-primitives";
import { useAccountState } from "@/lib/mock/account-context";

export default function BillingSummarySection() {
  const { state } = useAccountState();
  const hasBalance = Number.isFinite(state.balanceUsd);
  const balanceLabel = hasBalance ? `$${state.balanceUsd.toFixed(2)}` : "$—";

  return (
    <Panel
      title="Billing summary"
      action={
        <Button asChild variant="ghost">
          <Link href="/account/billing/credits">
            Manage billing
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      }
    >
      <dl className="grid max-w-[720px] grid-cols-1 gap-y-3 text-body sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-x-8 sm:gap-y-4">
        <dt className="text-muted-foreground">Current tier</dt>
        <dd className="text-foreground">Tier {state.tier}</dd>

        <dt className="text-muted-foreground">Credit balance</dt>
        <dd className="tabular-nums text-foreground">{balanceLabel}</dd>
      </dl>
    </Panel>
  );
}
