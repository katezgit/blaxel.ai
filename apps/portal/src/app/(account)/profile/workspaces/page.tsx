import type { Metadata } from "next";
import MembershipsClient from "./_components/memberships-client";
import { workspaceMemberships } from "@/lib/mock/profile";

export const metadata: Metadata = {
  title: "Workspaces",
};

export default function ProfileWorkspacesPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="typography-display font-semibold text-foreground">
          Workspaces
        </h1>
        <p className="text-muted-foreground">
          Workspaces you belong to. Leave the ones you no longer need.
        </p>
      </header>

      <MembershipsClient initialMemberships={workspaceMemberships} />
    </div>
  );
}
