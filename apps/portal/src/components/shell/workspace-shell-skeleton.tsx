"use client";

import { Boxes, ChevronDown, Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/cn";
import { BrandMark } from "@/components/shell/brand-mark";
import { RouteSpinner } from "@/components/shell/route-spinner";
import { ShellFrame } from "@/components/shell/shell-frame";
import { Sidebar } from "@/components/shell/sidebar";
import {
  WORKSPACE_RESOURCES_DRAWER_ID,
  WORKSPACE_RESOURCES_LABEL,
  WORKSPACE_SETTINGS_DRAWER_ID,
  WORKSPACE_SETTINGS_LABEL,
  workspaceSubShellForPath,
} from "@/components/shell/workspace-shell";
import { useSidebarState } from "@/components/shell/use-sidebar-state";
import { useIsSidebarRail } from "@/components/shell/use-is-sidebar-rail";
import {
  workspaceNavGroups,
  workspaceSettingsNavItems,
} from "@/components/shell/nav-groups";

// Loading-boundary skin for the workspace surface. Locks the destination
// shell's shape (topbar grid + sidebar width + main content area) so the
// swap to the real shell, once data resolves, lands without reflow.
// Sub-shell discrimination (resources vs settings sidebar) is URL-derived —
// same predicate as WorkspaceShell.
//
// Business data (workspace name, user identity, balance) is not available
// at the loading boundary; those slots render as token-neutral Skeleton
// placeholders dimensioned to match the real components' chrome.
export function WorkspaceShellSkeleton() {
  const pathname = usePathname();
  const workspaceSlug = extractWorkspaceSlug(pathname);
  const { isSettings } = workspaceSubShellForPath(pathname, workspaceSlug);
  const { collapsed } = useSidebarState();

  const groups = useMemo(() => {
    if (isSettings) {
      return [
        {
          label: WORKSPACE_SETTINGS_LABEL,
          items: workspaceSettingsNavItems(workspaceSlug),
        },
      ];
    }
    return workspaceNavGroups(workspaceSlug);
  }, [workspaceSlug, isSettings]);

  const sidebarLabel = isSettings
    ? WORKSPACE_SETTINGS_LABEL
    : WORKSPACE_RESOURCES_LABEL;
  const mobileDrawerId = isSettings
    ? WORKSPACE_SETTINGS_DRAWER_ID
    : WORKSPACE_RESOURCES_DRAWER_ID;

  return (
    <ShellFrame
      collapsed={collapsed}
      topbar={<WorkspaceTopbarSkeleton mobileNavId={mobileDrawerId} />}
      sidebar={
        <Sidebar
          ariaLabel={sidebarLabel}
          groups={groups}
          collapsed={collapsed}
        />
      }
    >
      <RouteSpinner />
    </ShellFrame>
  );
}

// Workspace slug is the first path segment; falls back to a placeholder so
// nav-groups can still build href strings — those Links never resolve
// because the skeleton unmounts before any click. The fallback isn't user-
// visible because the sidebar labels are nav-derived, not slug-derived.
function extractWorkspaceSlug(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  return segments[0] ?? "";
}

interface WorkspaceTopbarSkeletonProps {
  mobileNavId: string;
}

function WorkspaceTopbarSkeleton({
  mobileNavId,
}: WorkspaceTopbarSkeletonProps) {
  const isRail = useIsSidebarRail();
  return (
    <header className="shell-topbar">
      <div data-zone="left">
        {/* Match the real IconButton size="md" nav-trigger so the mobile slot
            holds the same column width. */}
        <button
          type="button"
          data-slot="nav-trigger"
          aria-label="Open navigation"
          aria-controls={mobileNavId}
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

interface WorkspaceSwitcherSkeletonProps {
  isRail: boolean;
}

// Mirrors WorkspaceSwitcher's trigger button dimensions exactly — rail vs
// full padding, h-8 row, Boxes icon position. The workspace-name slot is the
// only placeholder; the chevron stays so column width is preserved.
// Off-ramp `max-md:py-0.5` (2px) mirrors the real WorkspaceSwitcher byte-for-
// byte; on-ramp values would shift trigger height a couple pixels on the
// skeleton -> real swap.
function WorkspaceSwitcherSkeleton({ isRail }: WorkspaceSwitcherSkeletonProps) {
  return (
    <div
      role="presentation"
      className={cn(
        "flex min-w-0 max-w-full items-center rounded-md border text-label font-medium text-foreground",
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

// Mirrors SearchTrigger's outer chrome (h-8 + same paddings + border) so the
// center column doesn't shift. Kbd hint omitted — would imply interactivity
// the skeleton doesn't have. Off-ramp `px-2.5` (10px) mirrors the real
// SearchTrigger byte-for-byte to keep the swap reflow-free.
function SearchTriggerSkeleton() {
  return (
    <div
      role="presentation"
      data-slot="search"
      className="flex h-8 w-full max-w-sm items-center gap-2 rounded-lg border border-form-field-border bg-field-rest px-2.5 text-body text-muted-foreground max-md:size-8 max-md:w-8 max-md:max-w-8 max-md:justify-center max-md:border-transparent max-md:bg-transparent max-md:px-0"
    >
      <Search className="size-4 shrink-0" aria-hidden="true" />
      <Skeleton className="hidden h-3 flex-1 rounded-sm md:block" />
    </div>
  );
}

// Mirrors IdentityCluster's row: notification + help icons (size-8), billing
// pill (h-7, off-ramp w-24 as a visual approximation of the real pill's
// intrinsic width), avatar (size-8). Heights and margins are copied from
// the real component so the right zone keeps its width across the swap.
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
