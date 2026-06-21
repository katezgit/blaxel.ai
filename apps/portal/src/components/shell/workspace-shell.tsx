"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { IconButton } from "@repo/ui/components/icon-button";
import { cn } from "@repo/ui/lib/cn";
import { BrandMark } from "@/components/shell/brand-mark";
import {
  CommandPaletteProvider,
  useCommandPaletteContext,
} from "@/components/shell/command-palette-provider";
import DevTierSwitcher from "@/components/shell/dev-tier-switcher";
import { IdentityCluster } from "@/components/shell/identity-cluster";
import { MobileNavDrawer } from "@/components/shell/mobile-nav-drawer";
import { SearchTrigger } from "@/components/shell/search-trigger";
import { ShellFrame } from "@/components/shell/shell-frame";
import { Sidebar } from "@/components/shell/sidebar";
import { SubShellSidebarReturnHeader } from "@/components/shell/sub-shell-sidebar-return-header";
import { useLastWorkspaceTracker } from "@/components/shell/use-last-workspace-tracker";
import { useSidebarShortcut } from "@/components/shell/use-sidebar-shortcut";
import { useSidebarState } from "@/components/shell/use-sidebar-state";
import {
  workspaceNavGroups,
  workspaceSettingsNavItems,
} from "@/components/shell/nav-groups";
import WorkspaceSwitcher from "@/components/shell/workspace-switcher";
import type { Org } from "@/lib/mock/types";

interface WorkspaceShellProps {
  currentOrg: Org;
  workspaces: ReadonlyArray<Org>;
  user: { name: string; email: string; tier: string };
  children: React.ReactNode;
}

// Sub-shell discrimination is route-local — mirrors the AccountShell pattern.
// Settings lives under /{workspace}/settings/* and switches the sidebar to a
// flat settings nav with a "return to app" header; resource routes get the
// three-group resources nav. Keeping this in one shell mounted at the
// workspace segment is what holds the chrome steady while children stream.
//
// Exported at module scope so any loading-boundary skin can resolve the
// sub-shell from the same predicate and never drift from the real shell.
export function workspaceSubShellForPath(
  pathname: string,
  workspaceSlug: string,
) {
  const settingsBase = `/${workspaceSlug}/settings`;
  const isSettings =
    pathname === settingsBase || pathname.startsWith(`${settingsBase}/`);
  return { isSettings };
}

export const WORKSPACE_RESOURCES_LABEL = "Workspace resources";
export const WORKSPACE_SETTINGS_LABEL = "Workspace settings";
export const WORKSPACE_RESOURCES_DRAWER_ID = "workspace-mobile-drawer";
export const WORKSPACE_SETTINGS_DRAWER_ID = "workspace-settings-mobile-drawer";

export function WorkspaceShell({
  currentOrg,
  workspaces,
  user,
  children,
}: WorkspaceShellProps) {
  const pathname = usePathname();
  const { isSettings } = workspaceSubShellForPath(pathname, currentOrg.slug);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { collapsed, toggle, mounted } = useSidebarState();
  useSidebarShortcut(toggle);
  useLastWorkspaceTracker(currentOrg.slug);

  const groups = useMemo(() => {
    if (isSettings) {
      return [
        {
          label: WORKSPACE_SETTINGS_LABEL,
          items: workspaceSettingsNavItems(currentOrg.slug),
        },
      ];
    }
    return workspaceNavGroups(currentOrg.slug);
  }, [currentOrg.slug, isSettings]);

  const sidebarLabel = isSettings
    ? WORKSPACE_SETTINGS_LABEL
    : WORKSPACE_RESOURCES_LABEL;
  const mobileDrawerId = isSettings
    ? WORKSPACE_SETTINGS_DRAWER_ID
    : WORKSPACE_RESOURCES_DRAWER_ID;
  const sidebarHeader = isSettings ? (
    <SubShellSidebarReturnHeader workspace={currentOrg} />
  ) : undefined;

  return (
    <CommandPaletteProvider>
      <ShellFrame
        collapsed={collapsed}
        topbar={
          <WorkspaceShellTopbar
            currentOrg={currentOrg}
            workspaces={workspaces}
            user={user}
            mobileNavId={mobileDrawerId}
            mobileNavOpen={drawerOpen}
            onOpenMobileNav={() => setDrawerOpen(true)}
            className={cn(isSettings && "shell-topbar-sub")}
          />
        }
        sidebar={
          <Sidebar
            ariaLabel={sidebarLabel}
            groups={groups}
            collapsed={collapsed}
            onToggle={toggle}
            transitionEnabled={mounted}
            header={sidebarHeader}
          />
        }
      >
        {children}
      </ShellFrame>
      <MobileNavDrawer
        id={mobileDrawerId}
        ariaLabel={sidebarLabel}
        groups={groups}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        header={
          isSettings
            ? (close) => (
                <SubShellSidebarReturnHeader
                  workspace={currentOrg}
                  onNavigate={close}
                />
              )
            : undefined
        }
      />
      <DevTierSwitcher />
    </CommandPaletteProvider>
  );
}

interface WorkspaceShellTopbarProps {
  currentOrg: Org;
  workspaces: ReadonlyArray<Org>;
  user: { name: string; email: string; tier: string };
  mobileNavId: string;
  mobileNavOpen: boolean;
  onOpenMobileNav: () => void;
  className?: string;
}

function WorkspaceShellTopbar({
  currentOrg,
  workspaces,
  user,
  mobileNavId,
  mobileNavOpen,
  onOpenMobileNav,
  className,
}: WorkspaceShellTopbarProps) {
  const { setOpen: setPaletteOpen } = useCommandPaletteContext();

  return (
    <header className={cn("shell-topbar", className)}>
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
