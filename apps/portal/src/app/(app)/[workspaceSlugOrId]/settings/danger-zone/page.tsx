import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace settings · Danger zone",
};

export default function DangerZonePage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">Danger zone</h1>
        <p className="text-muted-foreground">
          Archive workspace, transfer ownership, delete workspace. Page coming soon.
        </p>
      </header>
    </div>
  );
}
