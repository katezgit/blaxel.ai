"use client";

import { useEffect, useState, type ReactNode } from "react";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { SubShellSidebarReturnHeader } from "@/components/shell/sub-shell-sidebar-return-header";
import { AccountTopbar } from "@/components/shell/account-topbar";
import { CommandPaletteProvider } from "@/components/shell/command-palette-provider";
import { MobileNavDrawer } from "@/components/shell/mobile-nav-drawer";
import { Sidebar } from "@/components/shell/sidebar";
import { SkipToContent } from "@/components/shell/skip-to-content";
import { CollapsibleSidebarMarker } from "@/components/shell/use-is-sidebar-rail";
import { readLastWorkspaceSlug } from "@/components/shell/use-last-workspace-tracker";
import { useSidebarShortcut } from "@/components/shell/use-sidebar-shortcut";
import { useSidebarState } from "@/components/shell/use-sidebar-state";
import { PROFILE_NAV_GROUPS } from "@/components/shell/nav-groups";
import type { Org } from "@/lib/mock/types";

interface AccountShellProps {
  fallbackWorkspace: Org;
  workspaces: ReadonlyArray<Org>;
  user: { name: string; email: string; tier: string };
  children: ReactNode;
}

const MOBILE_DRAWER_ID = "profile-mobile-drawer";
const SIDEBAR_LABEL = "Profile";

export default function AccountShell({
  fallbackWorkspace,
  workspaces,
  user,
  children,
}: AccountShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { collapsed, toggle, mounted } = useSidebarState();
  useSidebarShortcut(toggle);
  const [returnWorkspace, setReturnWorkspace] = useState<Org>(fallbackWorkspace);

  useEffect(() => {
    const slug = readLastWorkspaceSlug();
    if (!slug) return;
    const match = workspaces.find((w) => w.slug === slug);
    if (match) setReturnWorkspace(match);
  }, [workspaces]);

  return (
    <TooltipProvider>
      <CommandPaletteProvider>
        <div className="flex h-screen flex-col overflow-hidden text-foreground">
          <SkipToContent />

          <CollapsibleSidebarMarker value={{ inCollapsible: true, userCollapsed: collapsed }}>
            <AccountTopbar
              user={user}
              mobileNavId={MOBILE_DRAWER_ID}
              mobileNavOpen={drawerOpen}
              onOpenMobileNav={() => setDrawerOpen(true)}
            />

            <div className="flex min-h-0 flex-1">
              <Sidebar
                ariaLabel={SIDEBAR_LABEL}
                groups={PROFILE_NAV_GROUPS}
                collapsed={collapsed}
                onToggle={toggle}
                transitionEnabled={mounted}
                header={<SubShellSidebarReturnHeader workspace={returnWorkspace} />}
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
            groups={PROFILE_NAV_GROUPS}
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            header={(close) => (
              <SubShellSidebarReturnHeader
                workspace={returnWorkspace}
                onNavigate={close}
              />
            )}
          />
        </div>
      </CommandPaletteProvider>
    </TooltipProvider>
  );
}
