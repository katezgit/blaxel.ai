import type { Metadata } from "next";
import CreateSandboxCard from "./_components/create-sandbox-card";
import ResourcesCard from "./_components/resources-card";
import WhatsNewCard from "./_components/whats-new-card";

export const metadata: Metadata = {
  title: "Get started",
};

export default function GetStartedPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <p className="typography-body text-muted-foreground max-w-3xl">
          Keep infinite sandboxes on auto standby, with all primitives to
          co-host your harness for near instant latency.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <CreateSandboxCard />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-5">
          <ResourcesCard />
          <WhatsNewCard />
        </div>
      </div>
    </div>
  );
}
