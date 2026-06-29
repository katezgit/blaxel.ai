import type { Metadata } from "next";
import CreateSandboxCard from "./_components/create-sandbox-card";

export const metadata: Metadata = {
  title: "Get started",
};

export default function GetStartedPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="typography-display font-semibold text-foreground">
          Get started
        </h1>
        <p className="typography-body text-muted-foreground max-w-prose">
          Keep infinite sandboxes on auto standby, with all primitives to
          co-host your harness for near instant latency.
        </p>
      </header>
      <div className="max-w-3xl">
        <CreateSandboxCard />
      </div>
    </div>
  );
}
