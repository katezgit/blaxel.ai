"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { Progress } from "@repo/ui/components/progress";
import { useRole } from "@/lib/mock/role-context";
import { Panel } from "@/app/(manage)/_components/page-primitives";
import { creditQueries } from "@/lib/query/credits";
import { limitQueries } from "@/lib/query/limits";
import { usageQueries } from "@/lib/query/usage";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { BurndownPanel } from "./burndown-panel";
import { UsageTable } from "./usage-table";

const NUMBER = new Intl.NumberFormat("en-US");

export function UsageView() {
  const { isAdmin } = useRole();
  const { accountId } = useCurrentTenancy();
  const { data: creditState } = useSuspenseQuery(creditQueries.state(accountId));
  const { data: limits } = useSuspenseQuery(limitQueries.list(accountId));
  const { data: usageRows } = useSuspenseQuery(usageQueries.list(accountId));
  const percentRemaining = Math.round((creditState.balance / creditState.total) * 100);

  return (
    <>
      {isAdmin ? (
        <div className="mb-4 flex justify-end">
          <Button asChild variant="ghost">
            <Link href="/manage/billing">
              Billing &amp; plan
              <ArrowRightIcon aria-hidden="true" className="size-3.5" />
            </Link>
          </Button>
        </div>
      ) : null}

      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <StatCard
          label="Credits remaining"
          value={`${NUMBER.format(creditState.balance)} / ${NUMBER.format(creditState.total)}`}
        >
          <div className="mt-2">
            <Progress value={percentRemaining} state="default" aria-hidden="true" />
          </div>
        </StatCard>
        <StatCard
          label="Current burn"
          value={`${creditState.burnRatePerHour} cr/hr`}
          sub="2 jobs · A100"
        />
        <StatCard
          label="Runway"
          value={`${creditState.runwayHours} hrs left`}
          sub="at current burn"
        />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <UsageTable rows={usageRows} />
        </Card>
        <div className="lg:col-span-1">
          <BurndownPanel />
        </div>
      </div>

      <Panel
        title="Limits"
        action={
          isAdmin ? (
            <Button asChild variant="ghost">
              <Link href="/manage/limits">
                Manage limits
                <ArrowRightIcon aria-hidden="true" className="size-3.5" />
              </Link>
            </Button>
          ) : undefined
        }
      >
        <div className="flex flex-col gap-4">
          {limits.map((limit) => {
            const percent = Math.round((limit.current / limit.max) * 100);
            return (
              <div key={limit.name} className="flex items-center gap-3">
                <span className="w-44 shrink-0 typography-body text-foreground">{limit.name}</span>
                <div className="flex-1">
                  <Progress value={percent} state="neutral" aria-label={limit.name} />
                </div>
                <span className="w-24 text-right font-mono typography-label text-muted-foreground tabular-nums">
                  {limit.current} / {limit.max}
                </span>
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  children?: ReactNode;
}

function StatCard({ label, value, sub, children }: StatCardProps) {
  return (
    <Card className="px-4 py-4">
      <span className="font-mono typography-caption uppercase tracking-widest text-meta-foreground">
        {label}
      </span>
      <span className="mt-1 block typography-display font-semibold text-foreground tabular-nums">
        {value}
      </span>
      {sub ? (
        <span className="mt-1 block font-mono typography-caption text-meta-foreground">
          {sub}
        </span>
      ) : null}
      {children}
    </Card>
  );
}
