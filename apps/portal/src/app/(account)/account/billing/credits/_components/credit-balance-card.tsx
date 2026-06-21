"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Panel } from "@/app/(manage)/_components/page-primitives";
import { useAccountState } from "@/lib/mock/account-context";

const formatUsd = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

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

export default function CreditBalanceCard() {
  const { state } = useAccountState();
  const lastTopUp = state.creditHistory.find((entry) => entry.type === "Top-up");
  const lastTopUpLabel = lastTopUp
    ? `Last top-up ${formatDate(lastTopUp.date)} — ${formatUsd(lastTopUp.amount)}`
    : "No top-ups yet";

  return (
    <Panel
      title="Credit balance"
      action={
        <Button asChild variant="primary">
          <Link href="/account/billing/credits/stripe-redirect">
            <Plus aria-hidden="true" />
            Add credits
          </Link>
        </Button>
      }
    >
      <output
        aria-live="polite"
        aria-atomic="true"
        className="block font-mono text-display font-semibold tabular-nums text-foreground"
      >
        {formatUsd(state.balanceUsd)}
      </output>
      <p className="mt-2 text-body text-muted-foreground">{lastTopUpLabel}</p>
    </Panel>
  );
}
