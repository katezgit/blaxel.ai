"use client";

import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
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
import { SkipToContent } from "@/components/shell/skip-to-content";
import { SubShellSidebarReturnHeader } from "@/components/shell/sub-shell-sidebar-return-header";
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
  workspaceSlugFromPath,
} from "@/components/shell/sub-shell-path";
import { useActiveWorkspace } from "@/components/shell/workspace-context";
import WorkspaceSwitcher from "@/components/shell/workspace-switcher";
import type { Org } from "@/lib/mock/types";

// One shell across every authenticated route. The rail <aside> AND the sub-pane
// <aside> are both rendered unconditionally so their DOM identity persists
// across /{slug} ↔ /profile, /{slug} ↔ /account, /{slug} ↔ /{slug}/settings/*.
// CSS — keyed off data-sub-shell-open on the wrapper — drives the slide. There
// is no JS animation, no View Transition API, no remount.
//
// Sub-pane content is route-derived inside the shell (settings / profile /
// account). The active workspace on workspace routes flows in via context from
// (app)/[workspaceSlugOrId]/layout.tsx; on /profile and /account the shell
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
  const activeWorkspace = useActiveWorkspace();
  const subShellKind = subShellKindForPath(pathname);
  const subShellOpen = subShellKind !== null;

  // Workspace shown in the topbar switcher + sub-shell return header.
  // Priority: URL workspace context > last-visited tracker (sub-shell routes) > fallback.
  // The tracker write happens further down via useLastWorkspaceTracker —
  // mounting this unconditionally means /profile and /account always get a
  // resolved workspace even on first paint (the fallback is the seed).
  const [trackedSlug, setTrackedSlug] = useState<string | null>(null);
  useEffect(() => {
    setTrackedSlug(readLastWorkspaceSlug());
  }, [pathname]);

  const headerWorkspace: Org = useMemo(() => {
    if (activeWorkspace) return activeWorkspace;
    if (trackedSlug) {
      const match = workspaces.find((w) => w.slug === trackedSlug);
      if (match) return match;
    }
    return fallbackWorkspace;
  }, [activeWorkspace, trackedSlug, workspaces, fallbackWorkspace]);

  // Tracker writes the workspace slug whenever a workspace route is active.
  // No-ops on /profile and /account (slug stays the last good value).
  useLastWorkspaceTracker(activeWorkspace?.slug ?? "");

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Rail (workspace nav) collapse: persistent, user's saved preference.
  const { collapsed: railCollapsed, toggle: toggleRail } = useSidebarState();

  // Sub-pane collapse: ephemeral. Resets to false (expanded) every time
  // `subShellOpen` flips false → true — entering a sub-shell from a main route,
  // OR first paint on a sub-shell route (the ref starts as undefined, so the
  // first effect run with subShellOpen=true counts as a transition). Never
  // persisted; toggling here must not write to the rail's storage key.
  const [subPaneCollapsed, setSubPaneCollapsed] = useState(false);
  const prevSubShellOpenRef = useRef<boolean | undefined>(undefined);
  useEffect(() => {
    if (prevSubShellOpenRef.current !== true && subShellOpen) {
      setSubPaneCollapsed(false);
    }
    prevSubShellOpenRef.current = subShellOpen;
  }, [subShellOpen]);

  // Whichever pane is on screen owns the chevron + ⌘B. Read its collapsed
  // value, call its toggler. ⌘B inside a sub-shell must NOT touch the rail's
  // persisted state — that's the whole point of the split.
  const visibleCollapsed = subShellOpen ? subPaneCollapsed : railCollapsed;
  const toggleVisiblePane = useCallback(() => {
    if (subShellOpen) {
      setSubPaneCollapsed((prev) => !prev);
    } else {
      toggleRail();
    }
  }, [subShellOpen, toggleRail]);
  useSidebarShortcut(toggleVisiblePane);

  // The rail (top-level workspace nav) — always renders workspace-resource
  // groups derived from the active workspace's slug.
  const railGroups = useMemo(
    () => workspaceNavGroups(headerWorkspace.slug),
    [headerWorkspace.slug],
  );

  // The sub-pane content depends on which sub-shell is open. When closed, we
  // still render the pane offscreen with whatever the last open content was so
  // the slide-out direction stays correct. To keep DOM identity stable, we
  // always render the pane and just swap its inner groups + label by kind.
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
    // settings (or closed — last-rendered content stays for clean slide-out)
    return {
      ariaLabel: "Workspace settings",
      drawerId: WORKSPACE_SETTINGS_DRAWER_ID,
      groups: [
        {
          label: "Workspace settings",
          items: workspaceSettingsNavItems(settingsSlug),
        },
      ],
    };
  }, [subShellKind, settingsSlug]);

  // Topbar variant — workspace routes show the full topbar (workspace switcher
  // + search); sub-shell routes show the simplified sub-topbar.
  const showFullTopbar = !subShellOpen;
  const mobileDrawerId = subShellOpen
    ? subPane.drawerId
    : WORKSPACE_RESOURCES_DRAWER_ID;
  const mobileGroups = subShellOpen ? subPane.groups : railGroups;
  const mobileAriaLabel = subShellOpen ? subPane.ariaLabel : "Workspace resources";

  return (
    <CommandPaletteProvider>
      <TooltipProvider>
        <div
          data-shell-frame
          data-sub-shell-open={subShellOpen || undefined}
          className={cn(
            "relative flex h-screen flex-col overflow-hidden text-foreground",
            // --shell-left-w drives the topbar grid column, the pane-stack
            // width, and the shared chevron's anchor. Tracks the currently
            // visible pane: on main routes it follows the rail (persistent);
            // on sub-shell routes it follows the sub-pane (ephemeral, resets
            // expanded on entry). Set explicitly in both branches so consumers
            // (including the chevron's left-(--shell-left-w)) never see an
            // empty variable.
            visibleCollapsed
              ? "[--shell-left-w:var(--sidebar-rail-w)]"
              : "[--shell-left-w:var(--sidebar-w)]",
          )}
        >
          <SkipToContent />
          <CollapsibleSidebarMarker
            value={{ inCollapsible: true, userCollapsed: visibleCollapsed }}
          >
            {showFullTopbar ? (
              <UnifiedTopbar
                workspace={headerWorkspace}
                workspaces={workspaces}
                user={user}
                mobileNavId={mobileDrawerId}
                mobileNavOpen={drawerOpen}
                onOpenMobileNav={() => setDrawerOpen(true)}
              />
            ) : (
              <SubShellTopbar
                user={user}
                mobileNavId={mobileDrawerId}
                mobileNavOpen={drawerOpen}
                onOpenMobileNav={() => setDrawerOpen(true)}
              />
            )}
            <div className="relative flex min-h-0 flex-1">
              {/* Pane stack reserves the sidebar column. Both panes are
                  absolutely positioned inside it and overlap — the CSS in
                  globals.css (translate-swap on data-sub-shell-open) drives
                  the slide. DOM identity persists across navigation; React
                  never unmounts either pane. */}
              <div className="shell-pane-stack hidden md:block">
                {/* Workspace rail. No onToggle — the shared chevron lives
                    outside the stack so the wrapper's overflow:hidden (which
                    clips the off-screen pane) doesn't clip the chevron. */}
                <div className="shell-rail">
                  <Sidebar
                    ariaLabel="Workspace resources"
                    groups={railGroups}
                    collapsed={railCollapsed}
                  />
                </div>
                {/* Sub-shell pane. Has its own ephemeral collapse state — ⌘B
                    on sub-shell routes flips this in memory only, never the
                    rail's persisted preference. Resets to expanded on every
                    fresh entry into a sub-shell. */}
                <div
                  className="shell-sub-pane"
                  aria-hidden={!subShellOpen}
                >
                  <Sidebar
                    ariaLabel={subPane.ariaLabel}
                    groups={subPane.groups}
                    collapsed={subPaneCollapsed}
                    header={
                      <SubShellSidebarReturnHeader workspace={headerWorkspace} />
                    }
                  />
                </div>
              </div>
              {/* Shared collapse chevron — sibling of the stack so it never
                  gets clipped by the stack's overflow:hidden. Centered on the
                  stack's right edge via left:--shell-left-w + translate-x.
                  Visible only at lg+ (matches Sidebar's lg:w-(--sidebar-w)
                  responsive breakpoint where the collapse affordance applies). */}
              <button
                type="button"
                onClick={toggleVisiblePane}
                aria-label={visibleCollapsed ? "Expand sidebar (⌘B)" : "Collapse sidebar (⌘B)"}
                aria-pressed={visibleCollapsed}
                className="absolute top-5 left-(--shell-left-w) z-overlay hidden size-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-meta-foreground shadow-card transition before:absolute before:-inset-1 before:content-[''] hover:text-foreground hover:bg-secondary-surface focus-visible:shadow-focus-ring lg:inline-flex"
              >
                {visibleCollapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
              </button>
              <main
                id="main-content"
                className="min-w-0 flex-1 overflow-y-auto bg-grid-backdrop bg-panel"
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
                  <SubShellSidebarReturnHeader
                    workspace={headerWorkspace}
                    onNavigate={close}
                  />
                )
              : undefined
          }
        />
        <DevTierSwitcher />
      </TooltipProvider>
    </CommandPaletteProvider>
  );
}

interface UnifiedTopbarProps {
  workspace: Org;
  workspaces: ReadonlyArray<Org>;
  user: { name: string; email: string; tier: string };
  mobileNavId: string;
  mobileNavOpen: boolean;
  onOpenMobileNav: () => void;
}

function UnifiedTopbar({
  workspace,
  workspaces,
  user,
  mobileNavId,
  mobileNavOpen,
  onOpenMobileNav,
}: UnifiedTopbarProps) {
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

interface SubShellTopbarProps {
  user: { name: string; email: string; tier: string };
  mobileNavId: string;
  mobileNavOpen: boolean;
  onOpenMobileNav: () => void;
}

function SubShellTopbar({
  user,
  mobileNavId,
  mobileNavOpen,
  onOpenMobileNav,
}: SubShellTopbarProps) {
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
