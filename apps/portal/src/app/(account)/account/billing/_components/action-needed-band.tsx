"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/cn";
import { useAccountState } from "@/lib/mock/account-context";

interface BillingAction {
  title: string;
  description: string;
  cta: { label: string; href: string };
}

function deriveActions(
  state: ReturnType<typeof useAccountState>["state"],
): BillingAction[] {
  const actions: BillingAction[] = [];
  const { brand } = state.paymentMethod;
  const hasPaymentMethod = brand !== null;
  const { enabled: autoOn, thresholdUsd, amountUsd } = state.autoTopUp;
  const openInvoices = state.invoices.filter((inv) => inv.status === "Open");

  // Payment method missing on a PAID tier is a real blocker.
  // Tier 0 = trial; no payment expected. Don't warn.
  if (!hasPaymentMethod && state.tier > 0) {
    actions.push({
      title: "Payment method missing.",
      description:
        "Paid-tier resources won't run without a payment method on file. Add one to keep usage active.",
      cta: {
        label: "Add payment method",
        href: "/account/billing/invoices-payment",
      },
    });
  }

  // Auto top-up is enabled but balance crossed the threshold — the rule isn't
  // protecting the account as configured.
  if (autoOn && state.balanceUsd < thresholdUsd) {
    actions.push({
      title: "Auto top-up threshold reached.",
      description: `Balance is below the $${thresholdUsd} threshold for the $${amountUsd} top-up rule.`,
      cta: { label: "Manage credits", href: "/account/billing/credits" },
    });
  }

  if (openInvoices.length > 0) {
    const sum = openInvoices.reduce((s, inv) => s + inv.amount, 0);
    actions.push({
      title: `${openInvoices.length} open invoice${openInvoices.length === 1 ? "" : "s"}.`,
      description: `Review and pay $${sum.toFixed(2)} in open invoices.`,
      cta: {
        label: "View invoices",
        href: "/account/billing/invoices-payment",
      },
    });
  }

  return actions;
}

export default function ActionNeededBand() {
  const { state } = useAccountState();
  const actions = deriveActions(state);

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {actions.map((action, idx) => (
        <Card
          key={idx}
          className={cn(
            "flex flex-col gap-3 p-4",
            "border-state-warning bg-state-warning-subtle",
            "sm:flex-row sm:items-center sm:justify-between",
          )}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-state-warning"
            />
            <div className="flex flex-col gap-1">
              <p className="typography-body font-medium text-foreground">
                {action.title}
              </p>
              <p className="typography-caption text-muted-foreground">
                {action.description}
              </p>
            </div>
          </div>
          <Button asChild variant="secondary" className="shrink-0">
            <Link href={action.cta.href}>{action.cta.label}</Link>
          </Button>
        </Card>
      ))}
    </div>
  );
}
