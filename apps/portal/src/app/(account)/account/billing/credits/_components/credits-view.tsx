"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { useAccountState } from "@/lib/mock/account-context";
import AutoTopUpForm from "./auto-top-up-form";
import CreditBalanceCard from "./credit-balance-card";
import MonthlyTopUpForm from "./monthly-top-up-form";
import TopUpHistoryTable from "./top-up-history-table";

export default function CreditsView() {
  const { state } = useAccountState();
  const topUpReceipts = state.receipts.filter(
    (receipt) => receipt.amount > 0,
  );

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">
          Credits &amp; top-ups
        </h1>
        <p className="text-muted-foreground">
          Fund your account and prevent interruptions.
        </p>
      </header>

      <CreditBalanceCard />
      <AutoTopUpForm />
      <MonthlyTopUpForm />

      <div className="flex items-start gap-2 rounded-md border border-border bg-secondary-surface px-4 py-3">
        <Info
          aria-hidden="true"
          className="mt-0.5 size-4 text-muted-foreground"
        />
        <p className="text-body text-foreground">
          Top-ups are charged to your default payment method.{" "}
          <Link
            href="/account/billing/invoices#payment-method"
            className="font-medium text-primary hover:underline focus-visible:shadow-focus-ring rounded-sm"
          >
            Manage payment method
          </Link>
          .
        </p>
      </div>

      <section
        aria-labelledby="top-up-history-label"
        className="flex flex-col gap-2"
      >
        <h2
          id="top-up-history-label"
          className="text-subtitle font-semibold text-foreground"
        >
          Top-up history
        </h2>
        <TopUpHistoryTable receipts={topUpReceipts} />
      </section>
    </div>
  );
}
