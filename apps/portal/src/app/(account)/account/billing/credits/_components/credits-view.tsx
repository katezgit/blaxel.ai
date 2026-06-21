"use client";

import CreditBalanceCard from "./credit-balance-card";
import TopUpSettingsCard from "./top-up-settings-card";

export default function CreditsView() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">
          Credits &amp; funding
        </h1>
        <p className="text-muted-foreground">
          Manage account balance and automatic funding.
        </p>
      </header>

      <CreditBalanceCard />
      <TopUpSettingsCard />
    </div>
  );
}
