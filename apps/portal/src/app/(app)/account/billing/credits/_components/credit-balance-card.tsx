"use client";

import Link from "next/link";
import { CreditCard, Plus } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
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
  const lastFundedLine = lastTopUp
    ? `Last funded ${formatDate(lastTopUp.date)} · ${formatUsd(lastTopUp.amount)}`
    : "No funding yet";
  const { brand, last4 } = state.paymentMethod;
  const hasPaymentMethod = brand !== null;
  const paymentSummary = hasPaymentMethod
    ? `Charged to ${brand} ending ${last4}`
    : "No payment method on file";

  return (
    <Card
      variant="elevated"
      className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-col gap-2">
        <span className="typography-meta font-mono uppercase tracking-[0.16em] text-meta-foreground">
          Available credits
        </span>
        <output
          aria-live="polite"
          aria-atomic="true"
          className="block font-mono typography-display font-bold tabular-nums leading-none text-foreground"
        >
          {formatUsd(state.balanceUsd)}
        </output>
        <p className="typography-caption text-muted-foreground">{lastFundedLine}</p>
        <p className="flex items-center gap-1.5 typography-caption text-muted-foreground">
          <CreditCard aria-hidden="true" className="size-3.5" />
          {paymentSummary}
        </p>
      </div>
      <Button asChild variant="primary" className="w-full sm:w-auto">
        <Link href="/account/billing/credits/stripe-redirect">
          <Plus aria-hidden="true" />
          Add credits
        </Link>
      </Button>
    </Card>
  );
}
