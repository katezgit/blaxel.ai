"use client";

import { Badge } from "@repo/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/cn";
import { useAccountState } from "@/lib/mock/account-context";
import type { CreditHistoryEntry, CreditHistoryType } from "@/lib/mock/account";

const TYPE_VARIANT: Record<CreditHistoryType, "success" | "brand-soft" | "neutral"> = {
  "Top-up": "success",
  Promo: "brand-soft",
  Purchase: "success",
  Usage: "neutral",
};

const formatDate = (iso: string): string => {
  const [year, month, day] = iso.split("-").map((part) => Number(part));
  if (!year || !month || !day) return iso;
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatSignedUsd = (value: number): string => {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `−${formatted}`;
  return formatted;
};

function sortNewestFirst(
  rows: ReadonlyArray<CreditHistoryEntry>,
): ReadonlyArray<CreditHistoryEntry> {
  return [...rows].sort((a, b) => b.date.localeCompare(a.date));
}

export default function CreditHistoryCard() {
  const { state } = useAccountState();
  const rows = sortNewestFirst(state.creditHistory);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="typography-subtitle font-semibold text-foreground">
          History
        </h2>
        <p className="typography-body text-muted-foreground">
          Top-ups, promotional credits, and usage.
        </p>
      </div>
      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card px-4 py-6">
          <p className="typography-body text-foreground">No credit activity yet.</p>
          <p className="typography-caption text-muted-foreground">
            Top-ups, promotional grants, and usage debits will appear here.
          </p>
        </div>
      ) : (
        <Table
          bordered
          totalCount={rows.length}
          pageOffset={0}
          aria-label="Credit history"
        >
          <caption className="sr-only">Credit history</caption>
          <colgroup>
            <col className="w-[140px]" />
            <col className="w-[110px]" />
            <col />
            <col className="w-[140px]" />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHeaderCell label="Date" />
              <TableHeaderCell label="Type" />
              <TableHeaderCell label="Description" />
              <TableHeaderCell label="Amount" numeric />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-muted-foreground">
                  {formatDate(row.date)}
                </TableCell>
                <TableCell>
                  <Badge variant={TYPE_VARIANT[row.type]}>{row.type}</Badge>
                </TableCell>
                <TableCell className="text-foreground">
                  {row.description}
                </TableCell>
                <TableCell
                  variant="numeric"
                  className={cn(
                    row.amount < 0 ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  {formatSignedUsd(row.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
