"use client";

import { useAccountState } from "@/lib/mock/account-context";
import CreditBalanceCard from "./credit-balance-card";
import TopUpHistoryTable from "./top-up-history-table";
import TopUpSettingsCard from "./top-up-settings-card";

export default function CreditsView() {
  const { state } = useAccountState();
  const topUpReceipts = state.receipts.filter(
    (receipt) => receipt.amount > 0,
  );

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">
          Credits &amp; top-ups
        </h1>
        <p className="text-muted-foreground">
          Fund your account and prevent interruptions.
        </p>
      </header>

      <CreditBalanceCard />
      <TopUpSettingsCard />

      <section
        aria-labelledby="top-up-history-label"
        className="flex flex-col gap-2"
      >
        <h2
          id="top-up-history-label"
          className="text-subtitle font-semibold text-foreground"
        >
          Top-up history
        </h2>
        <TopUpHistoryTable receipts={topUpReceipts} />
      </section>
    </div>
  );
}
