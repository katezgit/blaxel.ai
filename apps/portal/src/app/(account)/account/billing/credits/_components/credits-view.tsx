"use client";

import CreditBalanceCard from "./credit-balance-card";
import TopUpSettingsCard from "./top-up-settings-card";

export default function CreditsView() {
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
    </div>
  );
}
