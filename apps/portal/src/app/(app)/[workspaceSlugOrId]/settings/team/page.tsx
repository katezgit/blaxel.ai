import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace settings · Team",
};

export default function TeamPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">Team</h1>
        <p className="text-muted-foreground">
          Members, invites, roles, SSO. Page coming soon.
        </p>
      </header>
    </div>
  );
}
