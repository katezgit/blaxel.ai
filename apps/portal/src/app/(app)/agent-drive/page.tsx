import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Drive",
};

export default function AgentDrivePage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">Agent Drive</h1>
        <p className="text-muted-foreground">Placeholder.</p>
      </header>
    </div>
  );
}
