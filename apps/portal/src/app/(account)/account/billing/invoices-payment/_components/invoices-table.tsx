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
import { cn } from "@repo/ui/lib/cn";
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
        <p className="typography-body text-foreground">No invoices found.</p>
        <p className="typography-caption text-muted-foreground">
          Invoices are generated at the end of each billing period once charges
          exceed your credit balance.
        </p>
      </div>
    );
  }

  return (
    <Table
      bordered
      totalCount={invoices.length}
      pageOffset={0}
      aria-label="Invoices"
    >
      <caption className="sr-only">Invoices</caption>
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
          <TableHeaderCell label="Invoice" numeric />
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => {
          const isOpen = invoice.status === "Open";
          const rowHighlight = "bg-state-warning-subtle border-l-2 border-l-state-warning hover:bg-state-warning-subtle";
          return (
            <TableRow
              key={invoice.id}
              className={cn(isOpen && rowHighlight)}
            >
              <TableCell className="text-muted-foreground">
                {formatDate(invoice.date)}
              </TableCell>
              <TableCell variant="numeric">{formatUsd(invoice.amount)}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[invoice.status]} showDot>
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <a
                  href={invoice.downloadHref}
                  className="inline-flex items-center gap-1 rounded-sm text-foreground transition-colors duration-fast ease-out-standard hover:text-primary hover:underline focus-visible:shadow-focus-ring"
                >
                  <ArrowDownToLine className="size-4" aria-hidden="true" />
                  Download
                </a>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
