"use client";

import BalanceAlertsCard from "./balance-alerts-card";
import CreditBalanceCard from "./credit-balance-card";
import CreditHistoryCard from "./credit-history-card";

export default function CreditsViewInner() {
  return (
    <div className="flex flex-col gap-8">
      <CreditBalanceCard />
      <BalanceAlertsCard />
      <CreditHistoryCard />
    </div>
  );
}
