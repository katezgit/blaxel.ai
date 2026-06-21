"use client";

import AvatarMenu from "@/components/shell/avatar-menu";
import BillingPill from "@/components/shell/billing-pill";
import HelpMenu from "@/components/shell/help-menu";
import { NotificationPanel } from "@/components/shell/notification-panel";

interface IdentityClusterProps {
  user: { name: string; email: string; tier: string };
}

export function IdentityCluster({ user }: IdentityClusterProps) {
  return (
    <div className="flex items-center gap-2">
      <NotificationPanel />
      <HelpMenu />
      <span className="hidden sm:inline">
        <BillingPill />
      </span>
      <AvatarMenu user={user} />
    </div>
  );
}
