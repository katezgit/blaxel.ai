import type { Metadata } from "next";
import AccountIdentitySection from "./_components/account-identity";
import BillingSummarySection from "./_components/billing-summary";
import WorkspacesSummarySection from "./_components/workspaces-summary";

export const metadata: Metadata = {
  title: "Account overview",
};

export default function AccountOverviewPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">
          Account overview
        </h1>
        <p className="text-muted-foreground">
          Account identity, admins, and workspace structure.
        </p>
      </header>

      <AccountIdentitySection />
      <WorkspacesSummarySection />
      <BillingSummarySection />
    </div>
  );
}
