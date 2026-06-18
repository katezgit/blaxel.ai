import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCP servers",
};

export default function McpServersPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">MCP servers</h1>
        <p className="text-muted-foreground">Placeholder.</p>
      </header>
    </div>
  );
}
