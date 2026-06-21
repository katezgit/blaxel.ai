import { Badge } from "@repo/ui/components/badge";
import type { InvoiceStatus, Receipt } from "@/lib/mock/account";

interface TopUpHistoryTableProps {
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

export default function TopUpHistoryTable({ receipts }: TopUpHistoryTableProps) {
  if (receipts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card px-4 py-6">
        <p className="text-body text-foreground">No top-ups yet.</p>
        <p className="text-caption text-muted-foreground">
          Once you top up — manually, on auto, or on a monthly schedule —
          history appears here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <table className="w-full border-collapse text-body">
        <caption className="sr-only">Top-up history</caption>
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
              Payment method
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
              <td className="px-4 py-3 text-foreground">
                {receipt.paymentMethodLabel}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
