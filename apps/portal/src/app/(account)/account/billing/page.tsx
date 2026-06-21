import type { Metadata } from "next";
import ActionNeededBand from "./_components/action-needed-band";
import BillingStatusCard from "./_components/billing-status-card";
import BillingSummaryPanel from "./_components/billing-summary-panel";
import RecentActivityPanel from "./_components/recent-activity-panel";

export const metadata: Metadata = {
  title: "Plan & billing",
};

export default function BillingOverviewPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">
          Plan & billing overview
        </h1>
        <p className="text-muted-foreground">
          Review account billing status, credits, usage, and payment readiness.
        </p>
      </header>

      <BillingStatusCard />

      <ActionNeededBand />

      <BillingSummaryPanel />

      <RecentActivityPanel />
    </div>
  );
}
