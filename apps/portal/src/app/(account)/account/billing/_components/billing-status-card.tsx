"use client";

import Link from "next/link";
import { CreditCard, ExternalLink, Plus } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";

import { Card } from "@repo/ui/components/card";
import { useAccountState } from "@/lib/mock/account-context";

const formatUsd = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

function computeForecast(mtdUsd: number): number {
  const now = new Date();
  const dayOfMonth = now.getUTCDate();
  const daysInMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0),
  ).getUTCDate();
  if (dayOfMonth <= 0) return 0;
  return (mtdUsd / dayOfMonth) * daysInMonth;
}

export default function BillingStatusCard() {
  const { state } = useAccountState();
  const { brand, last4 } = state.paymentMethod;
  const hasPaymentMethod = brand !== null;
  const autoTopUpOn = state.autoTopUp.enabled;
  const forecastUsd = computeForecast(state.monthToDateSpendUsd);

  const primaryCta = hasPaymentMethod
    ? {
        label: "Add credits",
        href: "/account/billing/credits",
        icon: <Plus aria-hidden="true" />,
        external: false,
      }
    : {
        label: "Add payment method",
        href: "/account/billing/credits/stripe-redirect",
        icon: <CreditCard aria-hidden="true" />,
        external: true,
      };

  return (
    <Card
      variant="elevated"
      className="flex flex-col gap-4 bg-elevated-surface p-6 sm:flex-row sm:items-start sm:justify-between"
    >
      <dl className="grid flex-1 grid-cols-1 gap-x-8 gap-y-4 text-body sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Current tier">
          <Badge variant="brand-soft" size="sm">Tier {state.tier}</Badge>
        </Field>
        <Field label="Available credits">
          <span className="font-mono font-medium tabular-nums text-foreground">
            {formatUsd(state.balanceUsd)}
          </span>
        </Field>
        <Field label="Auto top-up">
          {autoTopUpOn ? (
            <Badge variant="success" showDot>
              On
            </Badge>
          ) : (
            <Badge variant="neutral">Off</Badge>
          )}
        </Field>
        <Field label="Payment method">
          {hasPaymentMethod ? (
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <CreditCard
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              {brand} ending {last4}
            </span>
          ) : (
            <span className="text-muted-foreground">Not set</span>
          )}
        </Field>
        <Field label="Month-to-date">
          <span className="font-mono font-medium tabular-nums text-foreground">
            {formatUsd(state.monthToDateSpendUsd)}
          </span>
        </Field>
        <Field label="Forecasted month-end">
          <span className="font-mono font-medium tabular-nums text-foreground">
            {formatUsd(forecastUsd)}
          </span>
        </Field>
      </dl>

      <Button asChild variant="primary">
        <Link href={primaryCta.href}>
          {primaryCta.icon}
          {primaryCta.label}
          {primaryCta.external ? (
            <ExternalLink aria-hidden="true" />
          ) : null}
        </Link>
      </Button>
    </Card>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-2">{children}</dd>
    </div>
  );
}
