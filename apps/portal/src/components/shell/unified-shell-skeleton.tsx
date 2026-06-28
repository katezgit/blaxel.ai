"use client";

import { ArrowLeft, Boxes, ChevronDown, Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/cn";
import { BrandMark } from "@/components/shell/brand-mark";
import { RouteSpinner } from "@/components/shell/route-spinner";
import { Sidebar } from "@/components/shell/sidebar";
import { SkipToContent } from "@/components/shell/skip-to-content";
import {
  CollapsibleSidebarMarker,
  useIsSidebarRail,
} from "@/components/shell/use-is-sidebar-rail";
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

// Loading-boundary skin for the unified shell. Locks the destination shape
// (topbar variant + rail + sub-pane + content area) so the swap to the real
// shell, once data resolves, lands without reflow. Sub-shell discrimination
// reuses the same URL predicates the real shell consumes.
//
// On first paint into a sub-shell route (/profile/security, /account/...,
// /{slug}/settings/general), this renders at rest with the sub-pane already
// in the open position — the CSS `transition` only fires on a property change,
// not on the initial style application.
export function UnifiedShellSkeleton() {
  const pathname = usePathname();
  const subShellKind = subShellKindForPath(pathname);
  const subShellOpen = subShellKind !== null;
  const { collapsed } = useSidebarState();

  // Workspace slug for resource nav + sub-pane settings nav. The first path
  // segment on workspace routes; on profile/account it's unknown — fall back
  // to a placeholder slug so href construction stays string-stable.
  const segments = pathname.split("/").filter(Boolean);
  const workspaceSlug = segments[0] && !["profile", "account"].includes(segments[0])
    ? segments[0]
    : "";
  const settingsSlug = workspaceSlugFromPath(pathname) ?? workspaceSlug;

  // Mirror unified-shell's `subPaneCollapsed` reset semantics. The real shell
  // resets the sub-pane to expanded every time `subShellOpen` flips false→true
  // — including the very first paint on a sub-shell route. The skeleton must
  // paint the same visible-pane state so hydration doesn't snap the sub-pane
  // open. The rail keeps the saved preference (off-screen here anyway).
  const visibleCollapsed = subShellOpen ? false : collapsed;

  const railGroups = useMemo(
    () => workspaceNavGroups(workspaceSlug),
    [workspaceSlug],
  );

  const subPane = useMemo(() => {
    if (subShellKind === "profile") {
      return { ariaLabel: "Profile", groups: PERSONAL_NAV_GROUPS };
    }
    if (subShellKind === "account") {
      return { ariaLabel: "Account", groups: ACCOUNT_NAV_GROUPS };
    }
    return {
      ariaLabel: "Workspace settings",
      groups: [
        {
          label: "Workspace settings",
          items: workspaceSettingsNavItems(settingsSlug),
        },
      ],
    };
  }, [subShellKind, settingsSlug]);

  return (
    <div
      data-shell-frame
      data-sub-shell-open={subShellOpen || undefined}
      className={cn(
        "relative flex h-screen flex-col overflow-hidden text-foreground",
        // ⌘B is the single source of truth on both buckets — width follows
        // the rail OR sub-pane the user is about to see. Set explicitly in
        // both branches so the chevron's left-(--shell-left-w) anchor reads a
        // non-empty variable. Matches unified-shell, including the sub-shell
        // entry reset (sub-pane always paints expanded on entry).
        visibleCollapsed
          ? "[--shell-left-w:var(--sidebar-rail-w)]"
          : "[--shell-left-w:var(--sidebar-w)]",
      )}
    >
      <SkipToContent />
      <CollapsibleSidebarMarker
        value={{ inCollapsible: true, userCollapsed: visibleCollapsed }}
      >
        {subShellOpen ? (
          <SubShellTopbarSkeleton />
        ) : (
          <WorkspaceTopbarSkeleton />
        )}
        <div className="relative flex min-h-0 flex-1">
          <div className="shell-pane-stack hidden md:block">
            <div className="shell-rail">
              <Sidebar
                ariaLabel="Workspace resources"
                groups={railGroups}
                collapsed={collapsed}
              />
            </div>
            <div
              className="shell-sub-pane"
              aria-hidden={!subShellOpen}
            >
              <Sidebar
                ariaLabel={subPane.ariaLabel}
                groups={subPane.groups}
                collapsed={visibleCollapsed}
                header={<ReturnHeaderSkeleton />}
              />
            </div>
          </div>
          <main className="min-w-0 flex-1 overflow-y-auto bg-grid-backdrop bg-background">
            <RouteSpinner />
          </main>
        </div>
      </CollapsibleSidebarMarker>
    </div>
  );
}

function WorkspaceTopbarSkeleton() {
  const isRail = useIsSidebarRail();
  return (
    <header className="shell-topbar">
      <div data-zone="left">
        <button
          type="button"
          data-slot="nav-trigger"
          aria-label="Open navigation"
          disabled
          className="inline-flex size-8 items-center justify-center rounded-md text-foreground"
        >
          <Menu className="size-4" aria-hidden="true" />
        </button>
        <span data-slot="brand">
          <BrandMark />
        </span>
        <span data-slot="ws">
          <WorkspaceSwitcherSkeleton isRail={isRail} />
        </span>
      </div>
      <div data-zone="center">
        <SearchTriggerSkeleton />
      </div>
      <div data-zone="right">
        <IdentityClusterSkeleton />
      </div>
    </header>
  );
}

function SubShellTopbarSkeleton() {
  return (
    <header className="shell-topbar shell-topbar-sub">
      <div data-zone="left">
        <button
          type="button"
          data-slot="nav-trigger"
          aria-label="Open navigation"
          disabled
          className="inline-flex size-8 items-center justify-center rounded-md text-foreground"
        >
          <Menu className="size-4" aria-hidden="true" />
        </button>
        <span data-slot="brand">
          <BrandMark />
        </span>
      </div>
      <div data-zone="right">
        <IdentityClusterSkeleton />
      </div>
    </header>
  );
}

function WorkspaceSwitcherSkeleton({ isRail }: { isRail: boolean }) {
  return (
    <div
      role="presentation"
      className={cn(
        "flex min-w-0 max-w-full items-center rounded-md border typography-label font-medium text-foreground",
        isRail
          ? "border-transparent p-1"
          : "w-full gap-1.5 border-border px-2 py-1 max-md:gap-1 max-md:px-1.5 max-md:py-0.5",
      )}
    >
      <Boxes
        aria-hidden="true"
        className="size-4 shrink-0 text-meta-foreground"
      />
      {!isRail && (
        <>
          <Skeleton className="h-4 min-w-0 flex-1 rounded-sm" />
          <ChevronDown
            aria-hidden="true"
            className="size-4 shrink-0 text-meta-foreground"
          />
        </>
      )}
    </div>
  );
}

function SearchTriggerSkeleton() {
  return (
    <div
      role="presentation"
      data-slot="search"
      className="flex h-8 w-full max-w-sm items-center gap-2 rounded-lg border border-form-field-border bg-field-rest px-2.5 typography-body text-muted-foreground max-md:size-8 max-md:justify-center max-md:border-transparent max-md:bg-transparent max-md:px-0"
    >
      <Search className="size-4 shrink-0" aria-hidden="true" />
      <Skeleton className="hidden h-3 flex-1 rounded-sm md:block" />
    </div>
  );
}

function IdentityClusterSkeleton() {
  return (
    <div className="flex items-center">
      <Skeleton className="size-8 rounded-md" />
      <Skeleton className="ml-2 size-8 rounded-md" />
      <Skeleton className="ml-3 h-7 w-24 rounded-md" />
      <Skeleton className="ml-3 size-8 rounded-full" />
    </div>
  );
}

function ReturnHeaderSkeleton() {
  const isRail = useIsSidebarRail();
  return (
    <div className="pt-1 pb-2 border-b border-sidebar-border">
      <div
        data-sub-shell-return
        aria-hidden="true"
        className={cn(
          "flex h-8 items-center gap-2 rounded-md",
          isRail ? "justify-center px-0" : "px-2",
          "typography-body text-muted-foreground",
        )}
      >
        <ArrowLeft
          data-sub-shell-return-icon
          aria-hidden="true"
          className="size-4 shrink-0"
        />
        {!isRail && <Skeleton className="h-3 w-12 rounded-sm" />}
      </div>
    </div>
  );
}
