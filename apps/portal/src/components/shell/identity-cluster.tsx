"use client";

import { CircleHelp } from "lucide-react";
import { IconButton } from "@repo/ui/components/icon-button";
import AvatarMenu from "@/components/shell/avatar-menu";
import BillingPill from "@/components/shell/billing-pill";
import { NotificationPanel } from "@/components/shell/notification-panel";

interface IdentityClusterProps {
  user: { name: string; email: string; tier: string };
}

export function IdentityCluster({ user }: IdentityClusterProps) {
  return (
    <div className="flex items-center">
      <NotificationPanel />
      <IconButton
        variant="ghost"
        size="md"
        aria-label="Help and shortcuts"
        onClick={() => {}}
        className="ml-2 [&_svg]:size-5 [&_svg]:text-muted-foreground hover:[&_svg]:text-foreground"
      >
        <CircleHelp />
      </IconButton>
      <span className="ml-3">
        <BillingPill />
      </span>
      <span className="ml-3">
        <AvatarMenu user={user} />
      </span>
    </div>
  );
}
