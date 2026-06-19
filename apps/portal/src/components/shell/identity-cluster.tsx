"use client";

import { CircleHelp } from "lucide-react";
import { IconButton } from "@repo/ui/components/icon-button";
import AvatarMenu from "@/components/shell/avatar-menu";
import { NotificationPanel } from "@/components/shell/notification-panel";

interface IdentityClusterProps {
  user: { name: string; email: string; tier: string };
}

export function IdentityCluster({ user }: IdentityClusterProps) {
  return (
    <div className="flex items-center gap-2">
      <NotificationPanel />
      <IconButton
        variant="ghost"
        size="md"
        aria-label="Help and shortcuts"
        onClick={() => {}}
        className="[&_svg]:size-5 [&_svg]:text-muted-foreground hover:[&_svg]:text-foreground"
      >
        <CircleHelp />
      </IconButton>
      <AvatarMenu user={user} />
    </div>
  );
}
