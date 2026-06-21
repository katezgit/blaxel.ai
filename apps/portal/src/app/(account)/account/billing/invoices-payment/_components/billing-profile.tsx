"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { useAccountState } from "@/lib/mock/account-context";

const COUNTRY_CODE = "US";

export default function BillingProfile() {
  const { state } = useAccountState();
  const { brand, last4 } = state.paymentMethod;
  const { email, address } = state.billingContact;

  const paymentLabel =
    brand && last4 ? `${brand} ending ${last4}` : "No payment method on file";

  const addressLine = [
    address.line1,
    address.line2,
    `${address.city}, ${address.region} ${address.postalCode}`,
    COUNTRY_CODE,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <section
      aria-labelledby="billing-profile-label"
      className="flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2
            id="billing-profile-label"
            className="text-subtitle font-semibold text-foreground"
          >
            Billing profile
          </h2>
          <p className="text-caption text-muted-foreground">
            Synced from Stripe.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/account/billing/credits/stripe-redirect">
            Edit in Stripe
            <ExternalLink aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <dl className="grid grid-cols-1 gap-y-2 rounded-md border border-border bg-card px-4 py-4 text-body sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-x-6 sm:gap-y-3">
        <dt className="text-muted-foreground">Primary payment</dt>
        <dd className="text-foreground">{paymentLabel}</dd>

        <dt className="text-muted-foreground">Invoice email</dt>
        <dd className="text-foreground">{email}</dd>

        <dt className="text-muted-foreground">Billing address</dt>
        <dd className="text-foreground">
          <address className="not-italic">{addressLine}</address>
        </dd>
      </dl>
    </section>
  );
}
