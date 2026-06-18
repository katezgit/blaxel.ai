import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jobs",
};

export default function JobsPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">Jobs</h1>
        <p className="text-muted-foreground">Placeholder.</p>
      </header>
    </div>
  );
}
