"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import type { WorkspaceInvitation } from "@/lib/mock/profile";

const DATE_FMT = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

interface InvitationRowProps {
  invitation: WorkspaceInvitation;
  onAccept: () => void;
  onDecline: () => void;
}

export default function InvitationRow({
  invitation,
  onAccept,
  onDecline,
}: InvitationRowProps) {
  const initial = invitation.workspaceName.charAt(0).toUpperCase();

  return (
    <li>
      <Card className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft typography-body font-semibold text-primary"
          >
            {initial}
          </span>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="typography-body font-medium text-foreground">
                {invitation.workspaceName}
              </span>
              <Badge variant="neutral">{invitation.role}</Badge>
            </div>
            <span className="typography-caption text-muted-foreground">
              Invited by {invitation.invitedBy} on{" "}
              {DATE_FMT.format(new Date(invitation.invitedAt))}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" onClick={onDecline}>
            Decline
          </Button>
          <Button variant="primary" onClick={onAccept}>
            Accept
          </Button>
        </div>
      </Card>
    </li>
  );
}
