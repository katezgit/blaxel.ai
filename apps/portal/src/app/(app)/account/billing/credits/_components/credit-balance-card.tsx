"use client";

import { CreditCard, Plus, Zap } from "lucide-react";
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

const formatUsdCompact = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
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

  const autoOn = state.autoTopUp.enabled;
  const monthlyOn = state.monthlyTopUp.enabled;
  const anyRuleOn = autoOn || monthlyOn;
  const autoLabel = anyRuleOn ? "Automatic top-up" : "Enable auto top-up";

  return (
    <Card
      variant="elevated"
      className="flex flex-col gap-6 px-6 py-6 sm:flex-row sm:items-start sm:justify-between"
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
      <div className="flex flex-col items-stretch gap-3 sm:items-end">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <AutomaticTopUpDialog
            trigger={
              <Button variant="secondary" className="w-full sm:w-auto">
                <Zap aria-hidden="true" />
                {autoLabel}
              </Button>
            }
          />
          <UpgradeTierDialog
            trigger={
              <Button variant="primary" className="w-full sm:w-auto">
                <Plus aria-hidden="true" />
                Add credits
              </Button>
            }
          />
        </div>
        {anyRuleOn ? (
          <ul className="flex flex-col gap-1 typography-caption text-muted-foreground sm:items-end sm:text-right">
            {autoOn ? (
              <li>
                Auto top-up: when balance falls below{" "}
                <span className="font-mono text-foreground">
                  {formatUsdCompact(state.autoTopUp.thresholdUsd)}
                </span>
                , add{" "}
                <span className="font-mono text-foreground">
                  {formatUsdCompact(state.autoTopUp.amountUsd)}
                </span>
                {hasPaymentMethod ? null : " — awaiting payment method"}
              </li>
            ) : null}
            {monthlyOn ? (
              <li>
                Monthly top-up:{" "}
                <span className="font-mono text-foreground">
                  {formatUsdCompact(state.monthlyTopUp.amountUsd)}
                </span>{" "}
                on the 1st
                {hasPaymentMethod ? null : " — awaiting payment method"}
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </Card>
  );
}
