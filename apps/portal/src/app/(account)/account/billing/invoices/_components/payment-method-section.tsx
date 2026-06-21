"use client";

import Link from "next/link";
import { CreditCard, Pencil } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Panel } from "@/app/(manage)/_components/page-primitives";
import { useAccountState } from "@/lib/mock/account-context";

// Two-letter country code in the compressed address line — the demo fixture
// only ships US-based accounts, so the abbreviation is hardcoded rather than
// derived from the long-form `address.country` value.
const COUNTRY_CODE = "US";

export default function PaymentMethodSection() {
  const { state } = useAccountState();
  const { brand, last4 } = state.paymentMethod;
  const hasMethod = brand !== null;
  const { email, address } = state.billingContact;
  const addressLine = [
    address.line1,
    address.line2,
    `${address.city}, ${address.region} ${address.postalCode}`,
    COUNTRY_CODE,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Panel
      title="Payment setup"
      action={
        <Button asChild variant="secondary">
          <Link href="/account/billing/credits/stripe-redirect">
            <Pencil aria-hidden="true" />
            Manage billing
          </Link>
        </Button>
      }
    >
      <section id="payment-method" className="flex flex-col gap-4">
        {hasMethod ? (
          <div className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3">
            <CreditCard
              className="size-5 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="text-body text-foreground">
              {brand} ending {last4}
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-1 rounded-md border border-dashed border-border bg-card px-4 py-3">
            <p className="text-body text-foreground">
              No payment method on file.
            </p>
            <p className="text-caption text-muted-foreground">
              A payment method is required to top up credits and unlock Tier 1.
            </p>
          </div>
        )}

        <dl className="grid max-w-[640px] grid-cols-1 gap-y-3 text-body sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-x-8 sm:gap-y-4">
          <dt className="text-muted-foreground">Billing email</dt>
          <dd className="text-foreground">{email}</dd>

          <dt className="text-muted-foreground">Billing address</dt>
          <dd className="text-foreground">
            <address className="not-italic">{addressLine}</address>
          </dd>
        </dl>
      </section>
    </Panel>
  );
}
