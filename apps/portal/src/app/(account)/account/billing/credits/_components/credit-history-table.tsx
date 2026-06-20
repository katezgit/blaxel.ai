import { cn } from "@repo/ui/lib/cn";
import type { CreditHistoryEntry } from "@/lib/mock/account";

interface CreditHistoryTableProps {
  history: ReadonlyArray<CreditHistoryEntry>;
}

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

const formatAmount = (amount: number): string => {
  const sign = amount >= 0 ? "+" : "";
  return `${sign}${amount.toFixed(2)}`;
};

export function CreditHistoryTable({ history }: CreditHistoryTableProps) {
  if (history.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-card px-4 py-6 text-body text-muted-foreground">
        No credit history yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <table className="w-full border-collapse text-body">
        <caption className="sr-only">Credit history</caption>
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
              Type
            </th>
            <th
              scope="col"
              className="px-4 py-2 font-mono text-meta uppercase text-meta-foreground"
            >
              Description
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-right font-mono text-meta uppercase text-meta-foreground"
            >
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry) => (
            <tr
              key={entry.id}
              className="border-b border-border last:border-b-0"
            >
              <td className="px-4 py-3 text-muted-foreground">
                {formatDate(entry.date)}
              </td>
              <td className="px-4 py-3 text-foreground">{entry.type}</td>
              <td className="px-4 py-3 text-foreground">
                {entry.description}
              </td>
              <td
                className={cn(
                  "px-4 py-3 text-right font-mono tabular-nums",
                  entry.amount >= 0
                    ? "text-state-scored-text"
                    : "text-muted-foreground",
                )}
              >
                {formatAmount(entry.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
