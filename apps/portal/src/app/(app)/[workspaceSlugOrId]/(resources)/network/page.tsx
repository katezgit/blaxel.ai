import type { Metadata } from "next";
import { Network } from "lucide-react";
import { EmptyState } from "@repo/ui/components/empty-state";

export const metadata: Metadata = {
  title: "Network",
};

export default function NetworkPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="typography-display font-semibold text-foreground">Network</h1>
        <p className="text-muted-foreground">
          Per-resource ports and egress gateway controls in one workspace view.
        </p>
      </header>
      <EmptyState
        variant="zero-state"
        icon={Network}
        title="Coming soon"
        subtitle="A unified view for Sandbox ports and infrastructure egress is on the roadmap. Today these surface per-resource — check a Sandbox's detail page for its open ports."
        className="mx-auto max-w-md"
      />
    </div>
  );
}
