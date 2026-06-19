import type { Metadata } from "next";
import { Badge } from "@repo/ui/components/badge";

export const metadata: Metadata = {
  title: "Account · Billing",
};

export default function BillingPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="flex items-center gap-3">
          <h1 className="text-display font-semibold text-foreground">Billing</h1>
          <Badge variant="brand-soft">Tier 1</Badge>
        </div>
        <p className="text-muted-foreground">
          Subscription tier, payment method, usage charges, upgrade. Page coming soon.
        </p>
      </header>
    </div>
  );
}
