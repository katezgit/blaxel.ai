import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Placeholder.</p>
      </header>
    </div>
  );
}
