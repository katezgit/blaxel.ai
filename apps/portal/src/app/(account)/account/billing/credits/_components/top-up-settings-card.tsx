"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Panel } from "@/app/(manage)/_components/page-primitives";
import { useAccountState } from "@/lib/mock/account-context";
import AutoTopUpRule from "./auto-top-up-rule";
import MonthlyTopUpRule from "./monthly-top-up-rule";

type ExpandedRow = "auto" | "monthly" | null;

export default function TopUpSettingsCard() {
  const { state } = useAccountState();
  const { brand, last4 } = state.paymentMethod;
  const hasPaymentMethod = brand !== null;
  const paymentMethodLabel = hasPaymentMethod
    ? `${brand} ending ${last4}`
    : "No payment method on file";

  const [expandedRow, setExpandedRow] = useState<ExpandedRow>(null);

  const requestExpand = (row: "auto" | "monthly") => setExpandedRow(row);
  const collapseRow = () => setExpandedRow(null);

  return (
    <Panel
      title="Top-up settings"
      subtitle="Manage how credits are added to this account."
    >
      <div className="flex flex-col">
        <section
          aria-labelledby="payment-method-label"
          className="flex items-center justify-between gap-4 pb-6"
        >
          <div className="flex flex-col gap-0.5">
            <span
              id="payment-method-label"
              className="text-label text-muted-foreground"
            >
              Payment method
            </span>
            <span className="text-body text-foreground">
              {paymentMethodLabel}
            </span>
          </div>
          <Button asChild variant="secondary">
            <Link href="/account/billing/invoices#payment-method">
              {hasPaymentMethod ? "Change payment method" : "Add payment method"}
            </Link>
          </Button>
        </section>

        <section
          aria-labelledby="manual-top-up-heading"
          className="flex items-start justify-between gap-4 border-t border-border py-6"
        >
          <div className="flex flex-col gap-1">
            <h3
              id="manual-top-up-heading"
              className="text-body font-semibold text-foreground"
            >
              Manual top-up
            </h3>
            <p className="text-caption text-muted-foreground">
              Add credits once. Use this when you want to increase the balance
              immediately.
            </p>
          </div>
          <Button asChild variant="primary">
            <Link href="/account/billing/credits/stripe-redirect">
              <Plus aria-hidden="true" />
              Add credits
            </Link>
          </Button>
        </section>

        <section
          aria-labelledby="auto-rules-heading"
          className="flex flex-col gap-4 border-t border-border pt-6"
        >
          <h3
            id="auto-rules-heading"
            className="text-body font-semibold text-foreground"
          >
            Automatic top-up rules
          </h3>
          <div className="flex flex-col gap-3">
            <AutoTopUpRule
              isExpanded={expandedRow === "auto"}
              onRequestEdit={() => requestExpand("auto")}
              onCollapse={collapseRow}
            />
            <MonthlyTopUpRule
              isExpanded={expandedRow === "monthly"}
              onRequestEdit={() => requestExpand("monthly")}
              onCollapse={collapseRow}
            />
          </div>
        </section>
      </div>
    </Panel>
  );
}
