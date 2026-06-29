"use client";

import { Plus } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import UpgradeTierDialog from "@/components/billing/upgrade-tier-dialog";
import { useAccountState } from "@/lib/mock/account-context";
import AutomaticTopUpDialog from "./automatic-top-up-dialog";

const formatUsd = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

const formatMonthDay = (date: Date): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);

// Monthly top-up charges on the 1st of each month (mirrors the
// AutomaticTopUpDialog copy, which hardcodes "First of each month").
const nextFirstOfMonth = (now: Date): Date => {
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next;
};

export default function CreditBalanceCard() {
  const { state } = useAccountState();
  const hasPaymentMethod = state.paymentMethod.brand !== null;

  const hasAnyRuleEnabled =
    state.autoTopUp.enabled || state.monthlyTopUp.enabled;

  const secondaryLabel = hasAnyRuleEnabled
    ? "Edit top-up rules"
    : "Set up auto top-up";
  // Omit the ghost CTA when there's no card AND no rule to edit — the user
  // can't configure top-up without a payment method; that path lives on
  // Invoices & payment.
  const showSecondary = hasAnyRuleEnabled || hasPaymentMethod;

  return (
    <Card
      className="flex flex-col gap-5 p-5 sm:flex-row sm:items-stretch sm:justify-between sm:gap-6 sm:p-6"
    >
      <div className="flex flex-1 flex-col gap-2">
        <output
          aria-label="Available credits"
          aria-live="polite"
          aria-atomic="true"
          className="block font-mono typography-display font-bold tabular-nums leading-none text-foreground"
        >
          {formatUsd(state.balanceUsd)}
        </output>
        <p aria-hidden="true" className="typography-body text-muted-foreground">
          Available credits
        </p>
        {state.monthlyTopUp.enabled ? (
          <p className="mt-1 typography-caption text-muted-foreground">
            Next charge ·{" "}
            <span className="text-foreground">
              {formatUsd(state.monthlyTopUp.amountUsd)} on{" "}
              {formatMonthDay(nextFirstOfMonth(new Date()))}
            </span>
          </p>
        ) : null}
        {state.autoTopUp.enabled ? (
          <div>
            <RuleStatus
              label="Auto top-up"
              detail={`+${formatUsd(state.autoTopUp.amountUsd)} below ${formatUsd(state.autoTopUp.thresholdUsd)}`}
            />
          </div>
        ) : null}
        {!hasAnyRuleEnabled ? (
          <p className="mt-1 typography-caption text-muted-foreground">
            No automatic top-up configured
          </p>
        ) : null}
      </div>
      <div
        aria-hidden="true"
        className="h-px w-full bg-border sm:h-auto sm:w-px sm:self-stretch"
      />
      {/*
        Action column min-width (180px) prevents the primary CTA from
        collapsing below the ghost-button label ("Set up auto top-up")
        once the card splits side-by-side at the sm breakpoint.
      */}
      <div className="flex flex-col justify-center gap-2 sm:min-w-[180px]">
        <UpgradeTierDialog
          trigger={
            <Button variant="primary" className="w-full">
              <Plus aria-hidden="true" />
              Add credits
            </Button>
          }
        />
        {showSecondary ? (
          <AutomaticTopUpDialog
            trigger={
              <Button variant="ghost" className="w-full">
                {secondaryLabel}
              </Button>
            }
          />
        ) : null}
      </div>
    </Card>
  );
}

function RuleStatus({ label, detail }: { label: string; detail: string }) {
  return (
    <span className="flex items-center gap-1.5 typography-caption text-muted-foreground">
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full bg-state-scored"
      />
      {label} · {detail}
    </span>
  );
}
