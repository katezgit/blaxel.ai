"use client";

import { Menu } from "lucide-react";
import { IconButton } from "@repo/ui/components/icon-button";
import { BrandMark } from "@/components/shell/brand-mark";
import { IdentityCluster } from "@/components/shell/identity-cluster";

interface AccountTopbarProps {
  user: { name: string; email: string; tier: string };
  mobileNavId: string;
  mobileNavOpen: boolean;
  onOpenMobileNav: () => void;
}

export function AccountTopbar({
  user,
  mobileNavId,
  mobileNavOpen,
  onOpenMobileNav,
}: AccountTopbarProps) {
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
      <div data-zone="right">
        <IdentityCluster user={user} />
      </div>
    </header>
  );
}
