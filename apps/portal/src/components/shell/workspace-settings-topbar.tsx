"use client";

import { Menu } from "lucide-react";
import { IconButton } from "@repo/ui/components/icon-button";
import { BrandMark } from "@/components/shell/brand-mark";
import { useCommandPaletteContext } from "@/components/shell/command-palette-provider";
import { IdentityCluster } from "@/components/shell/identity-cluster";
import { SearchTrigger } from "@/components/shell/search-trigger";

interface WorkspaceSettingsTopbarProps {
  user: { name: string; email: string; tier: string };
  unreadNotifications: number;
  mobileNavId: string;
  mobileNavOpen: boolean;
  onOpenMobileNav: () => void;
}

export function WorkspaceSettingsTopbar({
  user,
  unreadNotifications,
  mobileNavId,
  mobileNavOpen,
  onOpenMobileNav,
}: WorkspaceSettingsTopbarProps) {
  const { setOpen: setPaletteOpen } = useCommandPaletteContext();

  return (
    <header className="shell-topbar shell-topbar-sub">
      <div data-zone="left">
        <IconButton
          variant="ghost"
          size="md"
          data-slot="nav-trigger"
          aria-label="Open navigation"
          aria-expanded={mobileNavOpen}
          aria-controls={mobileNavId}
          onClick={onOpenMobileNav}
        >
          <Menu />
        </IconButton>
        <span data-slot="brand">
          <BrandMark />
        </span>
      </div>
      <div data-zone="center">
        <SearchTrigger onClick={() => setPaletteOpen(true)} />
      </div>
      <div data-zone="right">
        <IdentityCluster user={user} unreadCount={unreadNotifications} />
      </div>
    </header>
  );
}
