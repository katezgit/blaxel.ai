"use client";

import { useMemo, useState, type ReactNode } from "react";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { CommandPaletteProvider } from "@/components/shell/command-palette-provider";
import { DevTierSwitcher } from "@/components/shell/dev-tier-switcher";
import { MobileNavDrawer } from "@/components/shell/mobile-nav-drawer";
import { Sidebar } from "@/components/shell/sidebar";
import { SkipToContent } from "@/components/shell/skip-to-content";
import { CollapsibleSidebarMarker } from "@/components/shell/use-is-sidebar-rail";
import { useLastWorkspaceTracker } from "@/components/shell/use-last-workspace-tracker";
import { useSidebarShortcut } from "@/components/shell/use-sidebar-shortcut";
import { useSidebarState } from "@/components/shell/use-sidebar-state";
import { workspaceNavGroups } from "@/components/shell/nav-groups";
import WorkspaceTopbar from "@/components/shell/workspace-topbar";
import type { Org } from "@/lib/mock/types";

interface WorkspaceShellProps {
  currentOrg: Org;
  workspaces: ReadonlyArray<Org>;
  user: { name: string; email: string; tier: string };
  children: ReactNode;
}

const MOBILE_DRAWER_ID = "workspace-mobile-drawer";
const SIDEBAR_LABEL = "Workspace resources";

export function WorkspaceShell({
  currentOrg,
  workspaces,
  user,
  children,
}: WorkspaceShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { collapsed, toggle, mounted } = useSidebarState();
  useSidebarShortcut(toggle);
  const groups = useMemo(
    () => workspaceNavGroups(currentOrg.slug),
    [currentOrg.slug],
  );
  useLastWorkspaceTracker(currentOrg.slug);

  return (
    <TooltipProvider>
      <CommandPaletteProvider>
        <div className="flex h-screen flex-col overflow-hidden text-foreground">
          <SkipToContent />

          <CollapsibleSidebarMarker value={{ inCollapsible: true, userCollapsed: collapsed }}>
            <WorkspaceTopbar
              currentOrg={currentOrg}
              workspaces={workspaces}
              user={user}
              mobileNavId={MOBILE_DRAWER_ID}
              mobileNavOpen={drawerOpen}
              onOpenMobileNav={() => setDrawerOpen(true)}
            />

            <div className="flex min-h-0 flex-1">
              <Sidebar
                ariaLabel={SIDEBAR_LABEL}
                groups={groups}
                collapsed={collapsed}
                onToggle={toggle}
                transitionEnabled={mounted}
              />
              <main
                id="main-content"
                className="min-w-0 flex-1 overflow-y-auto bg-grid-backdrop bg-panel"
              >
                {children}
              </main>
            </div>
          </CollapsibleSidebarMarker>

          <MobileNavDrawer
            id={MOBILE_DRAWER_ID}
            ariaLabel={SIDEBAR_LABEL}
            groups={groups}
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
          />
          <DevTierSwitcher />
        </div>
      </CommandPaletteProvider>
    </TooltipProvider>
  );
}
