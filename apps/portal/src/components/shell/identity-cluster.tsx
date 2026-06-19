"use client";

import { Bell, CircleHelp } from "lucide-react";
import { IconButton } from "@repo/ui/components/icon-button";
import { AvatarMenu } from "@/components/shell/avatar-menu";

interface IdentityClusterProps {
  user: { name: string; email: string; tier: string };
  unreadCount: number;
}

export function IdentityCluster({ user, unreadCount }: IdentityClusterProps) {
  return (
    <div className="flex items-center gap-0.5">
      <IconButton
        variant="ghost"
        size="md"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        onClick={() => {
          /* TODO: notifications panel — see wireframe §15 */
        }}
        className="relative [&_svg]:size-5"
      >
        <Bell />
        {unreadCount > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-state-errored px-1 font-mono text-meta font-semibold tracking-normal text-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </IconButton>
      <IconButton
        variant="ghost"
        size="md"
        aria-label="Help and shortcuts"
        onClick={() => {
          /* TODO: help panel — see wireframe §15 */
        }}
        className="[&_svg]:size-5"
      >
        <CircleHelp />
      </IconButton>
      <AvatarMenu user={user} />
    </div>
  );
}
