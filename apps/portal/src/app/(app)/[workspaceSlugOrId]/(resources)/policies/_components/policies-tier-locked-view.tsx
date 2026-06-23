"use client";

import { ArrowRight } from "lucide-react";
import { Card } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { AddPaymentMethodDialog } from "@/components/billing/add-payment-method-dialog";
import { PoliciesPageHeader } from "./policies-page-header";

export function PoliciesTierLockedView() {
  return (
    <div className="page-shell">
      <PoliciesPageHeader showCreate={false} />

      <section
        aria-labelledby="policies-locked-heading"
        className="flex max-w-2xl flex-col gap-6"
      >
        <div className="flex flex-col gap-1">
          <span className="font-mono typography-meta uppercase tracking-wider text-meta-foreground">
            Tier 1 feature
          </span>
          <h2
            id="policies-locked-heading"
            className="typography-subtitle font-semibold text-foreground"
          >
            Policies require Tier 1.
          </h2>
          <p className="typography-body text-muted-foreground">
            Control where workloads run, how many tokens they can consume, and
            which hardware flavor they land on. Add a payment method to unlock.
          </p>
        </div>

        <Card className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-1">
            <h3 className="typography-body font-semibold text-foreground">
              Activate Tier 1
            </h3>
            <p className="typography-body text-muted-foreground">
              Card details are managed on Stripe&apos;s hosted page. Tier 1
              activates as soon as a payment method is on file.
            </p>
          </div>
          <AddPaymentMethodDialog
            trigger={
              <Button variant="primary" className="self-start">
                Add payment method
                <ArrowRight aria-hidden="true" />
              </Button>
            }
          />
        </Card>
      </section>
    </div>
  );
}
