import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom domains",
};

export default function CustomDomainsPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">Custom domains</h1>
        <p className="text-muted-foreground">Placeholder.</p>
      </header>
    </div>
  );
}
