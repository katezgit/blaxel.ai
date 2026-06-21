"use client";

import { useAccountState } from "@/lib/mock/account-context";
import InvoicesTable from "./invoices-table";
import PaymentMethodSection from "./payment-method-section";
import ReceiptsTable from "./receipts-table";

export default function InvoicesView() {
  const { state } = useAccountState();

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">
          Invoices &amp; payment
        </h1>
        <p className="text-muted-foreground">
          Manage billing details and download billing records.
        </p>
      </header>

      <PaymentMethodSection />

      <section
        aria-labelledby="invoices-label"
        className="flex flex-col gap-2"
      >
        <h2
          id="invoices-label"
          className="text-subtitle font-semibold text-foreground"
        >
          Invoices
        </h2>
        <InvoicesTable invoices={state.invoices} />
      </section>

      <section
        aria-labelledby="receipts-label"
        className="flex flex-col gap-2"
      >
        <h2
          id="receipts-label"
          className="text-subtitle font-semibold text-foreground"
        >
          Receipts &amp; credit purchases
        </h2>
        <ReceiptsTable receipts={state.receipts} />
      </section>
    </div>
  );
}
