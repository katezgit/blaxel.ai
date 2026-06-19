import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace settings · Usage & limits",
};

export default function UsageAndLimitsPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">Usage &amp; limits</h1>
        <p className="text-muted-foreground">
          Quotas, soft limits, current usage rollup with drill-down to billing. Page coming soon.
        </p>
      </header>
    </div>
  );
}
