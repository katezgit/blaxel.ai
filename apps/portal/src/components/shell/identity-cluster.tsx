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
    <div className="flex items-center">
      <NotificationPanel />
      <span className="ml-2">
        <HelpMenu />
      </span>
      <span className="hidden sm:ml-3 sm:inline">
        <BillingPill />
      </span>
      <span className="ml-4 sm:ml-3">
        <AvatarMenu user={user} />
      </span>
    </div>
  );
}
