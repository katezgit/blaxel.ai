import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace settings · General",
};

export default function GeneralPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">General</h1>
        <p className="text-muted-foreground">
          Workspace name, slug, default region, default time zone. Page coming soon.
        </p>
      </header>
    </div>
  );
}
