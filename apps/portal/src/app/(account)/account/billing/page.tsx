import type { Metadata } from "next";
import CreditBalanceCard from "./_components/credit-balance-card";
import CurrentLimitsCard from "./_components/current-limits-card";
import MtdSpendCard from "./_components/mtd-spend-card";
import PaymentStatusCard from "./_components/payment-status-card";
import TierStatusCard from "./_components/tier-status-card";

export const metadata: Metadata = {
  title: "Billing overview",
};

export default function BillingOverviewPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">
          Billing overview
        </h1>
        <p className="text-muted-foreground">
          Account funding, spend, and limits at a glance.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TierStatusCard />
        <CreditBalanceCard />
        <MtdSpendCard />
        <PaymentStatusCard />
        <CurrentLimitsCard />
      </div>
    </div>
  );
}
