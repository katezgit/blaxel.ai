import { ArrowDownToLine } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import type { InvoiceStatus, Receipt } from "@/lib/mock/account";

interface ReceiptsTableProps {
  receipts: ReadonlyArray<Receipt>;
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

export default function ReceiptsTable({ receipts }: ReceiptsTableProps) {
  if (receipts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card px-4 py-6">
        <p className="text-body text-foreground">No receipts found.</p>
        <p className="text-caption text-muted-foreground">
          Receipts appear here once you top up credits or purchase add-ons.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <table className="w-full border-collapse text-body">
        <caption className="sr-only">Receipts and credit purchases</caption>
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
              className="px-4 py-2 text-right font-mono text-meta uppercase text-meta-foreground"
            >
              Amount
            </th>
            <th
              scope="col"
              className="px-4 py-2 font-mono text-meta uppercase text-meta-foreground"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-4 py-2 font-mono text-meta uppercase text-meta-foreground"
            >
              Receipt
            </th>
          </tr>
        </thead>
        <tbody>
          {receipts.map((receipt) => (
            <tr
              key={receipt.id}
              className="border-b border-border last:border-b-0"
            >
              <td className="px-4 py-3 text-muted-foreground">
                {formatDate(receipt.date)}
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">
                {formatUsd(receipt.amount)}
              </td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_VARIANT[receipt.status]} showDot>
                  {receipt.status}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <a
                  href={receipt.downloadHref}
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
