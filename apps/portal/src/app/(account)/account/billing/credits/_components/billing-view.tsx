"use client";

import { useAccountState } from "@/lib/mock/account-context";
import { AutoTopUpForm } from "./auto-top-up-form";
import { BalanceAlerts } from "./balance-alerts";
import { BalanceTile } from "./balance-tile";
import { CreditHistoryTable } from "./credit-history-table";
import { InvoicesTable } from "./invoices-table";
import { MonthlyTopUpForm } from "./monthly-top-up-form";
import { MtdSpend } from "./mtd-spend";
import { PaymentMethodSection } from "./payment-method";
import { SectionLabel } from "./section-label";
import { WalletTable } from "./wallet-table";

const currentMonthLabel = (): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date());

export function BillingView() {
  const { state } = useAccountState();

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">Billing</h1>
        <p className="text-muted-foreground">
          Credit balance, spend history, and top-up configuration for this
          account.
        </p>
      </header>

      <section
        aria-labelledby="section-a-label"
        className="flex flex-col gap-4"
      >
        <SectionLabel
          id="section-a-label"
          letter="A"
          label="Credit balance & spend history"
        />
        <BalanceTile state={state} />
        <div className="flex flex-col gap-2">
          <h2 className="text-body font-semibold text-foreground">
            Wallet composition
          </h2>
          <WalletTable wallet={state.wallet} />
        </div>
        <MtdSpend
          monthLabel={currentMonthLabel()}
          totalUsd={state.monthToDateSpendUsd}
        />
        <div className="flex flex-col gap-2">
          <h2 className="text-body font-semibold text-foreground">
            Credit history
          </h2>
          <CreditHistoryTable history={state.creditHistory} />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-body font-semibold text-foreground">Invoices</h2>
          <InvoicesTable invoices={state.invoices} />
        </div>
      </section>

      {/* Negative margins invert page-shell padding at each breakpoint so Section B
          background bleeds edge-to-edge without a wrapper element. */}
      <div
        className="relative -mx-4 mt-2 border-t border-border md:-mx-6 lg:-mx-8 xl:-mx-20"
        aria-hidden="true"
      />

      <section
        aria-labelledby="section-b-label"
        className="-mx-4 flex flex-col gap-4 rounded-lg bg-muted-surface px-4 py-6 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 xl:-mx-20 xl:px-20"
      >
        <SectionLabel
          id="section-b-label"
          letter="B"
          label="Top-up & alerts configuration"
        />
        <AutoTopUpForm />
        <MonthlyTopUpForm />
        <BalanceAlerts />
        <PaymentMethodSection />
      </section>
    </div>
  );
}
