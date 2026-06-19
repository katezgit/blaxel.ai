"use client";

import { Menu } from "lucide-react";
import { IconButton } from "@repo/ui/components/icon-button";
import { BrandMark } from "@/components/shell/brand-mark";
import { useCommandPaletteContext } from "@/components/shell/command-palette-provider";
import { IdentityCluster } from "@/components/shell/identity-cluster";
import { SearchTrigger } from "@/components/shell/search-trigger";
import WorkspaceSwitcher from "@/components/shell/workspace-switcher";
import type { Org } from "@/lib/mock/types";

interface WorkspaceTopbarProps {
  currentOrg: Org;
  workspaces: ReadonlyArray<Org>;
  user: { name: string; email: string; tier: string };
  mobileNavId: string;
  mobileNavOpen: boolean;
  onOpenMobileNav: () => void;
}

export default function WorkspaceTopbar({
  currentOrg,
  workspaces,
  user,
  mobileNavId,
  mobileNavOpen,
  onOpenMobileNav,
}: WorkspaceTopbarProps) {
  const { setOpen: setPaletteOpen } = useCommandPaletteContext();

  return (
    <header className="shell-topbar">
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
        <span data-slot="ws">
          <WorkspaceSwitcher currentOrg={currentOrg} workspaces={workspaces} />
        </span>
      </div>
      <div data-zone="center">
        <SearchTrigger onClick={() => setPaletteOpen(true)} />
      </div>
      <div data-zone="right">
        <IdentityCluster user={user} />
      </div>
    </header>
  );
}
