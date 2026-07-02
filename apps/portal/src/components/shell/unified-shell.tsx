"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { TooltipProvider } from "@repo/ui/components/tooltip";
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
import { Sidebar } from "@/components/shell/sidebar";
import { SidebarBrandRow } from "@/components/shell/sidebar-brand-row";
import { SidebarFooterIconStrip } from "@/components/shell/sidebar-footer-icon-strip";
import { SidebarUserChip } from "@/components/shell/sidebar-user-chip";
import { SkipToContent } from "@/components/shell/skip-to-content";
import {
  SubShellSidebarHeader,
  SubShellSidebarIdentity,
} from "@/components/shell/sub-shell-sidebar-header";
import { CollapsibleSidebarMarker } from "@/components/shell/use-is-sidebar-rail";
import { useLastWorkspaceTracker } from "@/components/shell/use-last-workspace-tracker";
import { readLastWorkspaceSlug } from "@/components/shell/use-last-workspace-tracker";
import { useSidebarShortcut } from "@/components/shell/use-sidebar-shortcut";
import { useSidebarState } from "@/components/shell/use-sidebar-state";
import {
  ACCOUNT_NAV_GROUPS,
  PERSONAL_NAV_GROUPS,
  workspaceNavGroups,
  workspaceSettingsNavItems,
} from "@/components/shell/nav-groups";
import {
  subShellKindForPath,
  workspaceSlugFromAnyPath,
  workspaceSlugFromPath,
} from "@/components/shell/sub-shell-path";
import WorkspaceSwitcher from "@/components/shell/workspace-switcher";
import type { Org } from "@/lib/mock/types";

// One shell across every authenticated route. At md+ the topbar element does
// not render (CSS: .shell-topbar { display: none }); the sidebar spans the
// full viewport height and owns brand + workspace + nav + utility chrome.
// Below md the topbar renders as the mobile chrome band above content — the
// sidebar is hidden and its contents surface via the drawer.
//
// ONE <Sidebar> mounts at a time; a `key` change on its wrapper forces React
// to unmount the old sidebar and mount the new one when `subShellOpen` flips.
// The new one slides in via the `shell-pane-slide-in-from-*` keyframe.
// Mirrors the Oak pattern at apps/web/app/_components/app-shell/sidebar.tsx.
//
// Sub-pane content is route-derived inside the shell (settings / profile /
// account). The active workspace on workspace routes is resolved from the URL
// pathname (workspaceSlugFromAnyPath) — UnifiedShell is mounted ABOVE the
// (app)/[workspaceSlugOrId]/layout that knows the workspace, so a React
// context would always read null here. On /profile and /account the shell
// falls back to the last-visited tracker, then the fallback workspace prop.

interface UnifiedShellProps {
  fallbackWorkspace: Org;
  workspaces: ReadonlyArray<Org>;
  user: { name: string; email: string; tier: string };
  children: ReactNode;
}

const WORKSPACE_RESOURCES_DRAWER_ID = "workspace-mobile-drawer";
const WORKSPACE_SETTINGS_DRAWER_ID = "workspace-settings-mobile-drawer";
const PROFILE_DRAWER_ID = "profile-mobile-drawer";
const ACCOUNT_DRAWER_ID = "account-mobile-drawer";

export function UnifiedShell({
  fallbackWorkspace,
  workspaces,
  user,
  children,
}: UnifiedShellProps) {
  const pathname = usePathname();
  const subShellKind = subShellKindForPath(pathname);
  const subShellOpen = subShellKind !== null;

  const urlSlug = workspaceSlugFromAnyPath(pathname);
  const urlWorkspace = useMemo(() => {
    if (!urlSlug) return null;
    return workspaces.find((w) => w.slug === urlSlug || w.id === urlSlug) ?? null;
  }, [urlSlug, workspaces]);

  const [trackedSlug, setTrackedSlug] = useState<string | null>(null);
  useEffect(() => {
    setTrackedSlug(readLastWorkspaceSlug());
  }, [pathname]);

  const headerWorkspace: Org = useMemo(() => {
    if (urlWorkspace) return urlWorkspace;
    if (trackedSlug) {
      const match = workspaces.find((w) => w.slug === trackedSlug);
      if (match) return match;
    }
    return fallbackWorkspace;
  }, [urlWorkspace, trackedSlug, workspaces, fallbackWorkspace]);

  useLastWorkspaceTracker(urlWorkspace?.slug ?? "");

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Rail (workspace nav) collapse: persistent, user's saved preference.
  const { collapsed: railCollapsed, toggle: toggleRail } = useSidebarState();

  // Sub-pane collapse: ephemeral. Resets to false (expanded) every time
  // `subShellOpen` flips false → true — entering a sub-shell from a main route,
  // OR first paint on a sub-shell route.
  const [subPaneCollapsed, setSubPaneCollapsed] = useState(false);
  const prevSubShellOpenRef = useRef<boolean | undefined>(undefined);
  useEffect(() => {
    if (prevSubShellOpenRef.current !== true && subShellOpen) {
      setSubPaneCollapsed(false);
    }
    prevSubShellOpenRef.current = subShellOpen;
  }, [subShellOpen]);

  // Slide-in direction tracking. Computed during render (Oak pattern):
  // entering a sub-shell slides in from the right (going deeper), leaving
  // slides the workspace nav back in from the left (returning to parent).
  const paneAnimClassRef = useRef("");
  const prevSubShellOpenForAnimRef = useRef<boolean | undefined>(undefined);
  if (prevSubShellOpenForAnimRef.current !== subShellOpen) {
    if (prevSubShellOpenForAnimRef.current !== undefined) {
      paneAnimClassRef.current = subShellOpen
        ? "shell-pane-slide-in-from-right"
        : "shell-pane-slide-in-from-left";
    }
    prevSubShellOpenForAnimRef.current = subShellOpen;
  }
  const paneAnimClass = paneAnimClassRef.current;

  const visibleCollapsed = subShellOpen ? subPaneCollapsed : railCollapsed;
  const toggleVisiblePane = useCallback(() => {
    if (subShellOpen) {
      setSubPaneCollapsed((prev) => !prev);
    } else {
      toggleRail();
    }
  }, [subShellOpen, toggleRail]);
  useSidebarShortcut(toggleVisiblePane);

  const railGroups = useMemo(
    () => workspaceNavGroups(headerWorkspace.slug),
    [headerWorkspace.slug],
  );

  const settingsSlug =
    subShellKind === "settings"
      ? workspaceSlugFromPath(pathname) ?? headerWorkspace.slug
      : headerWorkspace.slug;

  const subPane = useMemo(() => {
    if (subShellKind === "profile") {
      return {
        ariaLabel: "Profile",
        drawerId: PROFILE_DRAWER_ID,
        groups: PERSONAL_NAV_GROUPS,
      };
    }
    if (subShellKind === "account") {
      return {
        ariaLabel: "Account",
        drawerId: ACCOUNT_DRAWER_ID,
        groups: ACCOUNT_NAV_GROUPS,
      };
    }
    return {
      ariaLabel: "Workspace settings",
      drawerId: WORKSPACE_SETTINGS_DRAWER_ID,
      groups: [
        {
          label: "",
          items: workspaceSettingsNavItems(settingsSlug),
        },
      ],
    };
  }, [subShellKind, settingsSlug]);

  const mobileDrawerId = subShellOpen
    ? subPane.drawerId
    : WORKSPACE_RESOURCES_DRAWER_ID;
  const mobileGroups = subShellOpen ? subPane.groups : railGroups;
  const mobileAriaLabel = subShellOpen ? subPane.ariaLabel : "Workspace resources";

  const sidebarBrand = (
    <SidebarBrandRow
      onToggleCollapse={toggleVisiblePane}
      collapsed={visibleCollapsed}
    />
  );
  const sidebarFooter = (
    <>
      <SidebarFooterIconStrip />
      <SidebarUserChip user={{ name: user.name, email: user.email }} />
    </>
  );

  return (
    <CommandPaletteProvider>
      <TooltipProvider>
        <div
          data-shell-frame
          data-sub-shell-open={subShellOpen || undefined}
          className="relative flex h-screen flex-col overflow-hidden bg-grid-backdrop bg-background text-foreground"
        >
          <SkipToContent />
          <CollapsibleSidebarMarker
            value={{ inCollapsible: true, userCollapsed: visibleCollapsed }}
          >
            {/* Mobile-only topbar. .shell-topbar is display:none at md+, so
             * this row consumes zero layout space above the aside+main row on
             * desktop and tablet. */}
            {subShellOpen ? (
              <MobileSubShellTopbar
                user={user}
                mobileNavId={mobileDrawerId}
                mobileNavOpen={drawerOpen}
                onOpenMobileNav={() => setDrawerOpen(true)}
              />
            ) : (
              <MobileWorkspaceTopbar
                workspace={headerWorkspace}
                workspaces={workspaces}
                user={user}
                mobileNavId={mobileDrawerId}
                mobileNavOpen={drawerOpen}
                onOpenMobileNav={() => setDrawerOpen(true)}
              />
            )}
            <div
              className={cn(
                "relative flex min-h-0 flex-1",
                visibleCollapsed
                  ? "[--shell-left-w:var(--sidebar-rail-w)]"
                  : "[--shell-left-w:var(--sidebar-w)]",
              )}
            >
              {/* Sidebar column reserves layout width and clips the slide-in.
               * Inside, exactly ONE <Sidebar> is mounted at a time. */}
              <div className="shell-pane-column hidden md:block">
                <div
                  key={subShellOpen ? "sub" : "rail"}
                  className={cn("h-full", paneAnimClass)}
                >
                  {subShellOpen ? (
                    // Sub-shell (settings / profile / account) hides Zone C
                    // (icon strip) and Zone D (user chip) entirely — focused
                    // settings context with only brand + Back + identity chip
                    // + sub-nav. Footer prop is intentionally omitted.
                    <Sidebar
                      ariaLabel={subPane.ariaLabel}
                      groups={subPane.groups}
                      collapsed={subPaneCollapsed}
                      brand={sidebarBrand}
                      header={
                        <SubShellSidebarHeader
                          workspace={headerWorkspace}
                        />
                      }
                      preNav={
                        <SubShellSidebarIdentity
                          kind={subShellKind}
                          workspace={headerWorkspace}
                        />
                      }
                    />
                  ) : (
                    <Sidebar
                      ariaLabel="Workspace resources"
                      groups={railGroups}
                      collapsed={railCollapsed}
                      brand={sidebarBrand}
                      header={
                        <WorkspaceSwitcher
                          currentOrg={headerWorkspace}
                          workspaces={workspaces}
                        />
                      }
                      footer={sidebarFooter}
                    />
                  )}
                </div>
              </div>
              <main
                id="main-content"
                className="min-w-0 flex-1 overflow-y-auto"
              >
                {children}
              </main>
            </div>
          </CollapsibleSidebarMarker>
        </div>
        <MobileNavDrawer
          id={mobileDrawerId}
          ariaLabel={mobileAriaLabel}
          groups={mobileGroups}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          header={
            subShellOpen
              ? (close) => (
                  <div className="flex flex-col gap-2">
                    <SubShellSidebarHeader
                      workspace={headerWorkspace}
                      onNavigate={close}
                    />
                    <SubShellSidebarIdentity
                      kind={subShellKind}
                      workspace={headerWorkspace}
                    />
                  </div>
                )
              : undefined
          }
        />
        <DevTierSwitcher />
      </TooltipProvider>
    </CommandPaletteProvider>
  );
}

interface MobileWorkspaceTopbarProps {
  workspace: Org;
  workspaces: ReadonlyArray<Org>;
  user: { name: string; email: string; tier: string };
  mobileNavId: string;
  mobileNavOpen: boolean;
  onOpenMobileNav: () => void;
}

// Mobile topbar (<md only — .shell-topbar is display:none at md+). Renders
// brand + workspace-switcher + search + identity cluster in the horizontal
// chrome band above content. At md+ this element consumes zero layout space.
function MobileWorkspaceTopbar({
  workspace,
  workspaces,
  user,
  mobileNavId,
  mobileNavOpen,
  onOpenMobileNav,
}: MobileWorkspaceTopbarProps) {
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
          <WorkspaceSwitcher currentOrg={workspace} workspaces={workspaces} />
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

interface MobileSubShellTopbarProps {
  user: { name: string; email: string; tier: string };
  mobileNavId: string;
  mobileNavOpen: boolean;
  onOpenMobileNav: () => void;
}

// Mobile sub-shell topbar — brand-only + identity cluster. Covers profile /
// account / settings on mobile. At md+ this element consumes zero layout
// space (CSS: display: none).
function MobileSubShellTopbar({
  user,
  mobileNavId,
  mobileNavOpen,
  onOpenMobileNav,
}: MobileSubShellTopbarProps) {
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
        <IdentityCluster user={user} />
      </div>
    </header>
  );
}


