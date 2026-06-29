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
        <span className="typography-meta font-mono uppercase text-meta-foreground">
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
        {hasAnyRuleEnabled ? (
          <div className="mt-1 flex flex-col gap-1">
            {state.autoTopUp.enabled ? (
              <RuleStatus label="Auto top-up" />
            ) : null}
            {state.monthlyTopUp.enabled ? (
              <RuleStatus label="Monthly top-up" />
            ) : null}
          </div>
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

function RuleStatus({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-1.5 typography-caption text-muted-foreground">
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full bg-state-scored"
      />
      {label} · On
    </span>
  );
}
