"use client";

import { ArrowDownToLine } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { useAccountState } from "@/lib/mock/account-context";
import BillingProfile from "./billing-profile";
import InvoicesTable from "./invoices-table";
import ReceiptsTable from "./receipts-table";

export default function InvoicesView() {
  const { state } = useAccountState();
  const invoiceCount = state.invoices.length;
  const receiptCount = state.receipts.length;

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="typography-display font-semibold text-foreground">
          Invoices &amp; payment
        </h1>
        <p className="text-muted-foreground">
          Manage billing profile, payment method, and billing records.
        </p>
      </header>

      <BillingProfile />

      <section
        aria-labelledby="invoices-label"
        className="flex flex-col gap-2"
      >
        <div className="flex items-center justify-between gap-3">
          <h2
            id="invoices-label"
            className="typography-subtitle font-semibold text-foreground"
          >
            Invoices
          </h2>
          <Button
            variant="secondary"
            disabled={invoiceCount === 0}
            onClick={() =>
              toast.success(`Exported ${invoiceCount} invoice${invoiceCount === 1 ? "" : "s"} (mock).`)
            }
          >
            <ArrowDownToLine aria-hidden="true" />
            Export
          </Button>
        </div>
        <InvoicesTable invoices={state.invoices} />
      </section>

      <section
        aria-labelledby="receipts-label"
        className="flex flex-col gap-2"
      >
        <div className="flex items-center justify-between gap-3">
          <h2
            id="receipts-label"
            className="typography-subtitle font-semibold text-foreground"
          >
            Receipts &amp; credit purchases
          </h2>
          <Button
            variant="secondary"
            disabled={receiptCount === 0}
            onClick={() =>
              toast.success(`Exported ${receiptCount} receipt${receiptCount === 1 ? "" : "s"} (mock).`)
            }
          >
            <ArrowDownToLine aria-hidden="true" />
            Export
          </Button>
        </div>
        <ReceiptsTable receipts={state.receipts} />
      </section>
    </div>
  );
}
