"use client";

import Link from "next/link";
import { ArrowDownToLine } from "lucide-react";
import { Card } from "@repo/ui/components/card";
import { useAccountState } from "@/lib/mock/account-context";

const DATE_FMT = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

const formatUsd = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

interface ActivityEntry {
  id: string;
  date: string;
  label: string;
  amount: number;
  href: string;
}

const RECENT_LIMIT = 5;

export default function RecentActivityPanel() {
  const { state } = useAccountState();

  const entries: ActivityEntry[] = [
    ...state.invoices.map((inv) => ({
      id: `inv-${inv.id}`,
      date: inv.date,
      label: `Invoice ${inv.status.toLowerCase()}`,
      amount: inv.amount,
      href: inv.downloadHref,
    })),
    ...state.receipts.map((rec) => ({
      id: `rec-${rec.id}`,
      date: rec.date,
      label: `Credit purchase ${rec.status.toLowerCase()}`,
      amount: rec.amount,
      href: rec.downloadHref,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, RECENT_LIMIT);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-subtitle font-semibold text-foreground">
        Recent activity
      </h2>
      <Card className="p-4">
        {entries.length === 0 ? (
          <p className="text-body text-muted-foreground">
            No billing activity yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-3 text-body"
              >
                <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-muted-foreground">
                  <span className="text-foreground">
                    {DATE_FMT.format(new Date(entry.date))}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{entry.label}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-foreground">
                    {formatUsd(entry.amount)}
                  </span>
                </span>
                <Link
                  href={entry.href}
                  className="inline-flex items-center gap-1 rounded-sm text-foreground transition-colors duration-fast ease-out-standard hover:text-primary hover:underline focus-visible:shadow-focus-ring"
                >
                  <ArrowDownToLine className="size-4" aria-hidden="true" />
                  Download
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}
