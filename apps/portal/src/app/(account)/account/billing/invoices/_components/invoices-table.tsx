import { ArrowDownToLine } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import type { Invoice, InvoiceStatus } from "@/lib/mock/account";

interface InvoicesTableProps {
  invoices: ReadonlyArray<Invoice>;
}

const STATUS_VARIANT: Record<InvoiceStatus, "success" | "warning" | "neutral"> = {
  Paid: "success",
  Open: "warning",
  Draft: "neutral",
};

const formatDate = (iso: string): string => {
  const [year, month, day] = iso.split("-").map((part) => Number(part));
  if (!year || !month || !day) return iso;
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatUsd = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

export default function InvoicesTable({ invoices }: InvoicesTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card px-4 py-6">
        <p className="text-body text-foreground">No invoices found.</p>
        <p className="text-caption text-muted-foreground">
          Invoices are generated at the end of each billing period once charges
          exceed your credit balance.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <table className="w-full border-collapse text-body">
        <caption className="sr-only">Invoices</caption>
        <thead>
          <tr className="border-b border-border bg-muted-surface text-left">
            <th
              scope="col"
              className="px-4 py-2 font-mono text-meta uppercase text-meta-foreground"
            >
              Date
            </th>
            <th
              scope="col"
              className="px-4 py-2 font-mono text-meta uppercase text-meta-foreground"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-right font-mono text-meta uppercase text-meta-foreground"
            >
              Amount
            </th>
            <th
              scope="col"
              className="px-4 py-2 font-mono text-meta uppercase text-meta-foreground"
            >
              Invoice
            </th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr
              key={invoice.id}
              className="border-b border-border last:border-b-0"
            >
              <td className="px-4 py-3 text-muted-foreground">
                {formatDate(invoice.date)}
              </td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_VARIANT[invoice.status]} showDot>
                  {invoice.status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">
                {formatUsd(invoice.amount)}
              </td>
              <td className="px-4 py-3">
                <a
                  href={invoice.downloadHref}
                  className="inline-flex items-center gap-1 rounded-sm text-primary hover:underline focus-visible:shadow-focus-ring"
                >
                  <ArrowDownToLine className="size-4" aria-hidden="true" />
                  Download
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
