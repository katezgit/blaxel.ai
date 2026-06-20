import type { Metadata } from "next";
import { AccountIdentitySection } from "./_components/account-identity";
import { WorkspacesSummarySection } from "./_components/workspaces-summary";

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
          Account-level identity, billing tier, and workspace capacity.
        </p>
      </header>

      <AccountIdentitySection />
      <WorkspacesSummarySection />
    </div>
  );
}
