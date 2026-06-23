"use client";

import { ArrowLeft, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/cn";
import { BrandMark } from "@/components/shell/brand-mark";
import { RouteSpinner } from "@/components/shell/route-spinner";
import { ShellFrame } from "@/components/shell/shell-frame";
import { Sidebar } from "@/components/shell/sidebar";
import { useSidebarState } from "@/components/shell/use-sidebar-state";
import { useIsSidebarRail } from "@/components/shell/use-is-sidebar-rail";
import { accountSubShellForPath } from "@/components/shell/account-shell";

// Loading-boundary skin for the account/profile surface. Locks the
// destination shell's shape (sub-topbar grid + sidebar width + main
// content area) so the swap to the real AccountShell lands without
// reflow. Profile-vs-Account sub-shell discrimination is the same URL
// predicate the real shell uses.
export function AccountShellSkeleton() {
  const pathname = usePathname();
  const { groups, sidebarLabel, mobileDrawerId } =
    accountSubShellForPath(pathname);
  const { collapsed } = useSidebarState();

  return (
    <ShellFrame
      collapsed={collapsed}
      topbar={<AccountTopbarSkeleton mobileNavId={mobileDrawerId} />}
      sidebar={
        <Sidebar
          ariaLabel={sidebarLabel}
          groups={groups}
          collapsed={collapsed}
          header={<ReturnHeaderSkeleton />}
        />
      }
    >
      <RouteSpinner />
    </ShellFrame>
  );
}

interface AccountTopbarSkeletonProps {
  mobileNavId: string;
}

// Matches AccountTopbar: shell-topbar shell-topbar-sub (no center zone), so
// brand sits in the left zone and identity cluster on the right.
function AccountTopbarSkeleton({ mobileNavId }: AccountTopbarSkeletonProps) {
  return (
    <header className="shell-topbar shell-topbar-sub">
      <div data-zone="left">
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
      </div>
      <div data-zone="right">
        <IdentityClusterSkeleton />
      </div>
    </header>
  );
}

// Sidebar return header in account/profile sub-shells points back to the
// last-visited workspace — the workspace name + Org context isn't available
// at the loading boundary, so we render the arrow + a label-shape skeleton
// matching SubShellSidebarReturnHeader's row geometry (pt-1 wrapper +
// h-8 rounded row inside the parent nav's px-2 gutter) so hydration
// doesn't shift the row.
function ReturnHeaderSkeleton() {
  const isRail = useIsSidebarRail();
  return (
    <div className="pt-1">
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
