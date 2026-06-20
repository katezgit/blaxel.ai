import type { Metadata } from "next";
import WorkspacesClient from "./_components/workspaces-client";

export const metadata: Metadata = {
  title: "Workspaces",
};

export default function AccountWorkspacesPage() {
  return (
    <div className="page-shell">
      <WorkspacesClient />
    </div>
  );
}
