"use client";

import BalanceAlertsCard from "./balance-alerts-card";
import CreditBalanceCard from "./credit-balance-card";
import CreditHistoryCard from "./credit-history-card";
import TopUpSettingsCard from "./top-up-settings-card";

// Page-chrome-free body of the Credits surface. Used directly by the standalone
// /account/billing/credits route AND embedded inside <UpgradeTierDialog> from
// runtime paywall surfaces. Single source of truth — no logic duplication.
export default function CreditsViewInner() {
  return (
    <div className="flex flex-col gap-8">
      <CreditBalanceCard />
      <TopUpSettingsCard />
      <BalanceAlertsCard />
      <CreditHistoryCard />
    </div>
  );
}
