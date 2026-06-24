import type { Metadata } from "next";
import InvitationsClient from "./_components/invitations-client";
import { workspaceInvitations } from "@/lib/mock/profile";

export const metadata: Metadata = {
  title: "Invitations",
};

export default function InvitationsPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="typography-display font-semibold text-foreground">Invitations</h1>
        <p className="text-muted-foreground">
          Pending invites to join other Blaxel workspaces.
        </p>
      </header>

      <InvitationsClient initialInvitations={workspaceInvitations} />
    </div>
  );
}
