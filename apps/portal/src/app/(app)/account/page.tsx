import type { Metadata } from "next";
import AccountIdentityMeta from "./_components/account-identity-meta";
import AccountSummaryPanel from "./_components/account-summary-panel";

export const metadata: Metadata = {
  title: "Account overview",
};

export default function AccountOverviewPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="typography-display font-semibold text-foreground">
          Account overview
        </h1>
        <p className="text-muted-foreground">
          Account identity, admins, and workspace structure.
        </p>
        <AccountIdentityMeta />
      </header>

      <AccountSummaryPanel />
    </div>
  );
}
