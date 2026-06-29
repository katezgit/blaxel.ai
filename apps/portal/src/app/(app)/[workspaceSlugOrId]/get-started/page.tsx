import type { Metadata } from "next";
import CreateSandboxSection from "./_components/create-sandbox-section";

export const metadata: Metadata = {
  title: "Get started",
};

export default function GetStartedPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="page-shell sticky top-0 z-sticky bg-background pt-8 pb-6">
        <header className="page-header">
          <h1 className="typography-display font-semibold text-foreground">
            Get started
          </h1>
          <p className="typography-body text-muted-foreground max-w-prose">
            Keep infinite sandboxes on auto standby, with all primitives to
            co-host your harness for near instant latency.
          </p>
        </header>
      </div>
      <div className="page-shell flex-1 overflow-y-auto pt-0">
        <CreateSandboxSection />
      </div>
    </div>
  );
}
