"use client";

import CreditBalanceCard from "./credit-balance-card";
import TopUpSettingsCard from "./top-up-settings-card";

export default function CreditsView() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="typography-display font-semibold text-foreground">
          Credits
        </h1>
        <p className="text-muted-foreground">
          Manage your account credit balance and automatic top-ups.
        </p>
      </header>

      <div className="flex flex-col gap-8">
        <CreditBalanceCard />
        <TopUpSettingsCard />
      </div>
    </div>
  );
}
