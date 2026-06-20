"use client";

import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@repo/ui/lib/cn";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { CommandPaletteProvider } from "@/components/shell/command-palette-provider";
import { MobileNavDrawer } from "@/components/shell/mobile-nav-drawer";
import { Sidebar } from "@/components/shell/sidebar";
import { SkipToContent } from "@/components/shell/skip-to-content";
import { SubShellSidebarReturnHeader } from "@/components/shell/sub-shell-sidebar-return-header";
import { CollapsibleSidebarMarker } from "@/components/shell/use-is-sidebar-rail";
import { useLastWorkspaceTracker } from "@/components/shell/use-last-workspace-tracker";
import { useSidebarShortcut } from "@/components/shell/use-sidebar-shortcut";
import { useSidebarState } from "@/components/shell/use-sidebar-state";
import { workspaceSettingsNavItems } from "@/components/shell/nav-groups";
import WorkspaceSettingsTopbar from "@/components/shell/workspace-settings-topbar";
import type { Org } from "@/lib/mock/types";

interface WorkspaceSettingsShellProps {
  currentOrg: Org;
  workspaces: ReadonlyArray<Org>;
  user: { name: string; email: string; tier: string };
  children: ReactNode;
}

const MOBILE_DRAWER_ID = "workspace-settings-mobile-drawer";
const SIDEBAR_LABEL = "Workspace settings";

export default function WorkspaceSettingsShell({
  currentOrg,
  workspaces,
  user,
  children,
}: WorkspaceSettingsShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { collapsed, toggle, mounted } = useSidebarState();
  useSidebarShortcut(toggle);
  const groups = useMemo(
    () => [
      {
        label: SIDEBAR_LABEL,
        items: workspaceSettingsNavItems(currentOrg.slug),
      },
    ],
    [currentOrg.slug],
  );
  useLastWorkspaceTracker(currentOrg.slug);

  return (
    <TooltipProvider>
      <CommandPaletteProvider>
        <div
          className={cn(
            "flex h-screen flex-col overflow-hidden text-foreground",
            collapsed && "[--shell-left-w:var(--sidebar-rail-w)]",
          )}
        >
          <SkipToContent />

          <CollapsibleSidebarMarker value={{ inCollapsible: true, userCollapsed: collapsed }}>
            <WorkspaceSettingsTopbar
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
                header={<SubShellSidebarReturnHeader workspace={currentOrg} />}
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
            header={(close) => (
              <SubShellSidebarReturnHeader
                workspace={currentOrg}
                onNavigate={close}
              />
            )}
          />
        </div>
      </CommandPaletteProvider>
    </TooltipProvider>
  );
}
