"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { SubShellSidebarReturnHeader } from "@/components/shell/sub-shell-sidebar-return-header";
import { AccountTopbar } from "@/components/shell/account-topbar";
import { CommandPaletteProvider } from "@/components/shell/command-palette-provider";
import { DevTierSwitcher } from "@/components/shell/dev-tier-switcher";
import { MobileNavDrawer } from "@/components/shell/mobile-nav-drawer";
import { Sidebar } from "@/components/shell/sidebar";
import { SkipToContent } from "@/components/shell/skip-to-content";
import { CollapsibleSidebarMarker } from "@/components/shell/use-is-sidebar-rail";
import { readLastWorkspaceSlug } from "@/components/shell/use-last-workspace-tracker";
import { useSidebarShortcut } from "@/components/shell/use-sidebar-shortcut";
import { useSidebarState } from "@/components/shell/use-sidebar-state";
import {
  ACCOUNT_NAV_GROUPS,
  PERSONAL_NAV_GROUPS,
} from "@/components/shell/nav-groups";
import type { Org } from "@/lib/mock/types";

interface AccountShellProps {
  fallbackWorkspace: Org;
  workspaces: ReadonlyArray<Org>;
  user: { name: string; email: string; tier: string };
  children: ReactNode;
}

// Sub-shell discrimination is route-local: /profile/* is the per-user
// surface (personal nav only); everything else under (account) is the
// per-company Account surface (billing + administration nav). Reading
// the pathname here avoids passing React-component icon refs across the
// server-to-client prop boundary.
function navForPath(pathname: string) {
  const isProfile = pathname.startsWith("/profile");
  return {
    groups: isProfile ? PERSONAL_NAV_GROUPS : ACCOUNT_NAV_GROUPS,
    sidebarLabel: isProfile ? "Profile" : "Account",
    mobileDrawerId: isProfile
      ? "profile-mobile-drawer"
      : "account-mobile-drawer",
  };
}

export default function AccountShell({
  fallbackWorkspace,
  workspaces,
  user,
  children,
}: AccountShellProps) {
  const pathname = usePathname();
  const { groups, sidebarLabel, mobileDrawerId } = navForPath(pathname);
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
              mobileNavId={mobileDrawerId}
              mobileNavOpen={drawerOpen}
              onOpenMobileNav={() => setDrawerOpen(true)}
            />

            <div className="flex min-h-0 flex-1">
              <Sidebar
                ariaLabel={sidebarLabel}
                groups={groups}
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
            id={mobileDrawerId}
            ariaLabel={sidebarLabel}
            groups={groups}
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            header={(close) => (
              <SubShellSidebarReturnHeader
                workspace={returnWorkspace}
                onNavigate={close}
              />
            )}
          />
          <DevTierSwitcher />
        </div>
      </CommandPaletteProvider>
    </TooltipProvider>
  );
}
