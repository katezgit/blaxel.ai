import { Gift, ShoppingCart, TrendingUp, type LucideIcon } from "lucide-react";
import { Progress } from "@repo/ui/components/progress";
import type { WalletEntry, WalletEntryType } from "@/lib/mock/account";

const ICONS: Record<WalletEntryType, LucideIcon> = {
  promo: Gift,
  topup: TrendingUp,
  purchase: ShoppingCart,
};

interface WalletTableProps {
  wallet: ReadonlyArray<WalletEntry>;
}

const formatUsd = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

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

const formatExpiration = (iso: string | null): string => {
  if (!iso) return "Never";
  const [year, month] = iso.split("-").map((part) => Number(part));
  if (!year || !month) return iso;
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
};

export default function WalletTable({ wallet }: WalletTableProps) {
  if (wallet.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-card px-4 py-6 text-body text-muted-foreground">
        No active credits. Top up in the configuration section below, or earn
        free credits above.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <table className="w-full border-collapse text-body">
        <caption className="sr-only">Wallet composition</caption>
        <thead>
          <tr className="border-b border-border bg-muted-surface text-left">
            <th
              scope="col"
              className="px-4 py-2 font-mono text-meta uppercase text-meta-foreground"
            >
              Wallet composition
            </th>
            <th
              scope="col"
              className="px-4 py-2 font-mono text-meta uppercase text-meta-foreground"
            >
              Added on
            </th>
            <th
              scope="col"
              className="px-4 py-2 font-mono text-meta uppercase text-meta-foreground"
            >
              Usage
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
              Expiration
            </th>
          </tr>
        </thead>
        <tbody>
          {wallet.map((entry) => {
            const Icon = ICONS[entry.type];
            const usedPercent =
              entry.initial > 0
                ? Math.round(
                    ((entry.initial - entry.available) / entry.initial) * 100,
                  )
                : 0;
            return (
              <tr key={entry.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-foreground">
                    <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                    {entry.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(entry.addedOn)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <Progress
                      value={usedPercent}
                      state="neutral"
                      aria-label={`${entry.label}: ${usedPercent}% used`}
                    />
                    <span className="font-mono text-meta tabular-nums text-muted-foreground">
                      {(entry.initial - entry.available).toFixed(2)} /{" "}
                      {entry.initial.toFixed(2)} used
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">
                  {formatUsd(entry.amount)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatExpiration(entry.expiresOn)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
