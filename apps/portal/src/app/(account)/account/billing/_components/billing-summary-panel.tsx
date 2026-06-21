"use client";

import { Card } from "@repo/ui/components/card";
import { useAccountState } from "@/lib/mock/account-context";
import { tierProgressFor } from "./tier-progression";

const formatUsd = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

interface SummaryRow {
  label: string;
  value: string;
}

export default function BillingSummaryPanel() {
  const { state } = useAccountState();
  const progress = tierProgressFor(state.tier);
  const openInvoices = state.invoices.filter((inv) => inv.status === "Open");
  const activeAddons = state.addons.filter((a) => a.active);

  const tierValue = (() => {
    if (!progress.nextTier) {
      return `Tier ${state.tier} · highest tier reached`;
    }
    const next = progress.nextRequirement?.toLowerCase() ?? "";
    return `Tier ${state.tier} · ${next} for Tier ${progress.nextTier}`;
  })();

  const invoicesValue =
    openInvoices.length === 0
      ? "No open invoices"
      : `${openInvoices.length} open · ${formatUsd(openInvoices.reduce((s, i) => s + i.amount, 0))} due`;

  const addonsValue =
    activeAddons.length === 0
      ? "No services active"
      : `${activeAddons.length} active · ${activeAddons.map((a) => a.name).join(", ")}`;

  const rows: ReadonlyArray<SummaryRow> = [
    { label: "Tier", value: tierValue },
    { label: "Invoices", value: invoicesValue },
    { label: "Premium services", value: addonsValue },
  ];

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-subtitle font-semibold text-foreground">
        Billing summary
      </h2>
      <Card className="p-4">
        <dl className="grid grid-cols-1 gap-y-2 text-body sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-x-6 sm:gap-y-3">
          {rows.map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </section>
  );
}
