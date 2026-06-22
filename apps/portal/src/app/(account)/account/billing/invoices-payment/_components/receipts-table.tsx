import { ArrowDownToLine } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@repo/ui/components/table";
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
        <p className="typography-body text-foreground">No receipts found.</p>
        <p className="typography-caption text-muted-foreground">
          Receipts appear here once you top up credits or purchase add-ons.
        </p>
      </div>
    );
  }

  return (
    <Table
      bordered
      totalCount={receipts.length}
      pageOffset={0}
      aria-label="Receipts"
    >
      <caption className="sr-only">Receipts and credit purchases</caption>
      <colgroup>
        <col className="w-[160px]" />
        <col className="w-[140px]" />
        <col className="w-[100px]" />
        <col />
      </colgroup>
      <TableHeader>
        <TableRow>
          <TableHeaderCell label="Date" />
          <TableHeaderCell label="Amount" numeric />
          <TableHeaderCell label="Status" />
          <TableHeaderCell label="Receipt" numeric />
        </TableRow>
      </TableHeader>
      <TableBody>
        {receipts.map((receipt) => (
          <TableRow key={receipt.id}>
            <TableCell className="text-muted-foreground">
              {formatDate(receipt.date)}
            </TableCell>
            <TableCell variant="numeric">{formatUsd(receipt.amount)}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[receipt.status]} showDot>
                {receipt.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <a
                href={receipt.downloadHref}
                className="inline-flex items-center gap-1 rounded-sm text-foreground transition-colors duration-fast ease-out-standard hover:text-primary hover:underline focus-visible:shadow-focus-ring"
              >
                <ArrowDownToLine className="size-4" aria-hidden="true" />
                Download
              </a>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
