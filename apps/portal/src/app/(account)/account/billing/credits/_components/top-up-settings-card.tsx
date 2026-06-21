"use client";

import Link from "next/link";
import { useState } from "react";
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
      subtitle="Manage automatic credit top-ups."
    >
      <div className="flex flex-col gap-6">
        <section
          aria-labelledby="payment-method-label"
          className="flex flex-col gap-1"
        >
          <span
            id="payment-method-label"
            className="text-label text-muted-foreground"
          >
            Payment method
          </span>
          <div className="flex items-center gap-2 text-body text-foreground">
            <span>{paymentMethodLabel}</span>
            <span aria-hidden="true" className="text-muted-foreground">
              ·
            </span>
            <Link
              href="/account/billing/invoices#payment-method"
              className="text-primary hover:underline"
            >
              {hasPaymentMethod ? "Change payment method" : "Add payment method"}
            </Link>
          </div>
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
