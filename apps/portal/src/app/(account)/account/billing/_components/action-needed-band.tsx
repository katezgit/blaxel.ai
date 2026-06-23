"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Info,
  OctagonX,
  type LucideIcon,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { useAccountState } from "@/lib/mock/account-context";

type Severity = "destructive" | "warning" | "info";

interface BillingAction {
  severity: Severity;
  title: string;
  description: string;
  cta: { label: string; href: string };
}

const SEVERITY_ICON: Record<Severity, LucideIcon> = {
  destructive: OctagonX,
  warning: AlertTriangle,
  info: Info,
};

function deriveActions(
  state: ReturnType<typeof useAccountState>["state"],
): BillingAction[] {
  const actions: BillingAction[] = [];
  const { brand } = state.paymentMethod;
  const hasPaymentMethod = brand !== null;
  const { enabled: autoOn, thresholdUsd, amountUsd } = state.autoTopUp;
  const openInvoices = state.invoices.filter((inv) => inv.status === "Open");

  // Paid resources won't run without a payment method — account-blocking.
  // Tier 0 = trial; no payment expected.
  if (!hasPaymentMethod && state.tier > 0) {
    actions.push({
      severity: "destructive",
      title: "Payment method missing.",
      description:
        "Paid-tier resources won't run without a payment method on file. Add one to keep usage active.",
      cta: {
        label: "Add payment method",
        href: "/account/billing/invoices-payment",
      },
    });
  }

  // Auto top-up is enabled but balance crossed the threshold — the configured
  // safety rule isn't protecting the account as expected.
  if (autoOn && state.balanceUsd < thresholdUsd) {
    actions.push({
      severity: "warning",
      title: "Auto top-up threshold reached.",
      description: `Balance is below the $${thresholdUsd} threshold for the $${amountUsd} top-up rule.`,
      cta: { label: "Manage credits", href: "/account/billing/credits" },
    });
  }

  // Open invoices with payment on file are an FYI, not a risk —
  // info severity so the band doesn't overstate stakes.
  if (openInvoices.length > 0) {
    const sum = openInvoices.reduce((s, inv) => s + inv.amount, 0);
    actions.push({
      severity: "info",
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
      {actions.map((action, idx) => {
        const Icon = SEVERITY_ICON[action.severity];
        return (
          <Alert key={idx} variant={action.severity}>
            <Icon />
            <AlertTitle>{action.title}</AlertTitle>
            <AlertDescription>{action.description}</AlertDescription>
            <Button
              asChild
              variant="secondary"
              className="col-start-2 mt-2 justify-self-start"
            >
              <Link href={action.cta.href}>{action.cta.label}</Link>
            </Button>
          </Alert>
        );
      })}
    </div>
  );
}
