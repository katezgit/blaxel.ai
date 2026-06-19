import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace settings · Sandbox settings",
};

export default function SandboxSettingsPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">Sandbox settings</h1>
        <p className="text-muted-foreground">
          Workspace-wide sandbox defaults (idle timeout, max concurrency, base image). Page coming soon.
        </p>
      </header>
    </div>
  );
}
