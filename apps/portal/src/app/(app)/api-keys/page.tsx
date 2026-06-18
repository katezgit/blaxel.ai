import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API keys",
};

export default function ApiKeysPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">API keys</h1>
        <p className="text-muted-foreground">Placeholder.</p>
      </header>
    </div>
  );
}
