"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { CreditCard, Pencil } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { IconButton } from "@repo/ui/components/icon-button";
import { Progress } from "@repo/ui/components/progress";
import { Panel } from "@/app/(manage)/_components/page-primitives";
import { creditQueries } from "@/lib/query/credits";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";

const NUMBER = new Intl.NumberFormat("en-US");

export function BillingPlanPanel() {
  const { accountId } = useCurrentTenancy();
  const { data: creditState } = useSuspenseQuery(creditQueries.state(accountId));
  const percentRemaining = Math.round((creditState.balance / creditState.total) * 100);

  return (
    <Panel
      title="Plan"
      action={
        <Button variant="secondary">
          Manage plan
        </Button>
      }
    >
      <div className="flex items-baseline gap-3">
        <span className="text-display font-semibold text-foreground">Team</span>
        <span className="text-body text-muted-foreground">$0 base · pay per credit</span>
      </div>

      <div className="mt-6">
        <div className="mb-1.5 flex items-baseline justify-between font-mono text-label text-muted-foreground">
          <span>credits remaining</span>
          <span className="font-medium text-foreground tabular-nums">
            {NUMBER.format(creditState.balance)} / {NUMBER.format(creditState.total)}
          </span>
        </div>
        <Progress
          value={percentRemaining}
          state="default"
          aria-label="Credits remaining"
        />
      </div>

      <div className="mt-6 flex items-center justify-between font-mono text-label">
        <span className="uppercase tracking-widest text-muted-foreground">payment method</span>
        <span className="inline-flex items-center gap-1.5 text-foreground">
          <CreditCard aria-hidden="true" className="size-3.5 shrink-0" />
          <span>Visa ····4242</span>
          <IconButton variant="ghost" size="sm" aria-label="Edit payment method">
            <Pencil aria-hidden="true" />
          </IconButton>
        </span>
      </div>
    </Panel>
  );
}
