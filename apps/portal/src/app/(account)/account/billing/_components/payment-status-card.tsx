"use client";

import { CreditCard } from "lucide-react";
import { useAccountState } from "@/lib/mock/account-context";
import OverviewCard from "./overview-card";

export default function PaymentStatusCard() {
  const { state } = useAccountState();
  const { brand, last4 } = state.paymentMethod;
  const hasMethod = brand !== null;
  const invoiceCount = state.invoices.length;
  const invoiceLine =
    invoiceCount === 0
      ? "No invoices this month."
      : `${invoiceCount} invoice${invoiceCount === 1 ? "" : "s"} this month.`;

  return (
    <OverviewCard
      title="Payment status"
      primaryCta={{ label: "Manage payment", href: "/account/billing/invoices" }}
    >
      {hasMethod ? (
        <div className="inline-flex items-center gap-2 text-body text-foreground">
          <CreditCard
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
          <span>{brand} ending {last4}</span>
        </div>
      ) : (
        <p className="text-body text-foreground">No payment method on file.</p>
      )}
      <p className="text-body text-muted-foreground">{invoiceLine}</p>
    </OverviewCard>
  );
}
