"use client";

import Link from "next/link";
import { ArrowRight, CreditCard } from "lucide-react";
import { Panel } from "@/app/(manage)/_components/page-primitives";
import { useAccountState } from "@/lib/mock/account-context";

export function PaymentMethodSection() {
  const { state } = useAccountState();
  const hasMethod = state.paymentMethod.brand !== null;

  return (
    <Panel title="Payment method">
      <section id="payment-method" className="flex flex-col gap-4">
        {hasMethod ? (
          <div className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3">
            <CreditCard
              className="size-5 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="text-body text-foreground">
              {state.paymentMethod.brand} ending {state.paymentMethod.last4}
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2 rounded-md border border-dashed border-border bg-card px-4 py-3">
            <p className="text-body text-foreground">
              No payment method on file.
            </p>
            <p className="text-caption text-muted-foreground">
              Adding a payment method unlocks Tier 1 &mdash; enabling Volumes,
              Policies, Custom domains, Cron triggers, and Revisions.
            </p>
          </div>
        )}

        <Link
          href="/account/billing/credits/stripe-redirect"
          className="inline-flex w-fit items-center gap-1 text-body font-medium text-primary hover:underline focus-visible:shadow-focus-ring rounded-sm"
        >
          {hasMethod ? "Update payment method" : "Add payment method"}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
        <p className="text-caption text-meta-foreground">
          Opens Stripe to confirm the change.
        </p>
      </section>
    </Panel>
  );
}
