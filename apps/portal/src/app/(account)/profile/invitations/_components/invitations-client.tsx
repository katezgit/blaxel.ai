"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Card } from "@repo/ui/components/card";
import { EmptyState } from "@repo/ui/components/empty-state";
import { InvitationRow } from "./invitation-row";
import type { WorkspaceInvitation } from "@/lib/mock/profile";

interface InvitationsClientProps {
  initialInvitations: ReadonlyArray<WorkspaceInvitation>;
}

export function InvitationsClient({ initialInvitations }: InvitationsClientProps) {
  const [invitations, setInvitations] =
    useState<ReadonlyArray<WorkspaceInvitation>>(initialInvitations);

  const dismiss = (id: string) =>
    setInvitations((current) => current.filter((inv) => inv.id !== id));

  if (invitations.length === 0) {
    return (
      <Card className="px-6 py-6">
        <EmptyState
          variant="zero-state"
          icon={Mail}
          title="No invitations"
          subtitle="Pending workspace invites will show up here."
        />
      </Card>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {invitations.map((invitation) => (
        <InvitationRow
          key={invitation.id}
          invitation={invitation}
          onAccept={() => dismiss(invitation.id)}
          onDecline={() => dismiss(invitation.id)}
        />
      ))}
    </ul>
  );
}
