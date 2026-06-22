import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Network",
};

export default function NetworkPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="typography-display font-semibold text-foreground">Network</h1>
        <p className="text-muted-foreground">Coming soon.</p>
      </header>
    </div>
  );
}
