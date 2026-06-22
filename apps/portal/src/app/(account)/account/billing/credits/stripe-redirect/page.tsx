import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Stripe redirect",
};

/**
 * Demo stub. In production this route is the in-app redirect that hands off to
 * Stripe's hosted payment page; for the mock build it stays in-product so the
 * demo never leaves the surface, and the operator can navigate back.
 */
export default function StripeRedirectPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="typography-display font-semibold text-foreground">
          Payment method
        </h1>
        <p className="text-muted-foreground">
          The production build redirects to Stripe&apos;s hosted payment page.
          This is a demo placeholder.
        </p>
      </header>
      <Link
        href="/account/billing/credits#payment-method"
        className="inline-flex w-fit items-center gap-1 typography-body font-medium text-primary hover:underline focus-visible:shadow-focus-ring rounded-sm"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Back to Billing
      </Link>
    </div>
  );
}
