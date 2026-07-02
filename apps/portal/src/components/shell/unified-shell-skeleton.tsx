"use client";

import {
  ArrowLeft,
  Bell,
  BookOpen,
  Boxes,
  ChevronDown,
  ChevronsUpDown,
  HelpCircle,
  Menu,
  PanelLeft,
  Search,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
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
// (aside full-height with brand row + top utility row + optional header +
// nav + footer icon strip + user chip + content area) so the swap to the
// real shell, once data resolves, lands without reflow.
export function UnifiedShellSkeleton() {
  const pathname = usePathname();
  const subShellKind = subShellKindForPath(pathname);
  const subShellOpen = subShellKind !== null;
  const { collapsed } = useSidebarState();

  const segments = pathname.split("/").filter(Boolean);
  const workspaceSlug = segments[0] && !["profile", "account"].includes(segments[0])
    ? segments[0]
    : "";
  const settingsSlug = workspaceSlugFromPath(pathname) ?? workspaceSlug;

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

  const footerSkeleton = (
    <>
      <FooterIconStripSkeleton />
      <UserChipSkeleton />
    </>
  );

  return (
    <div
      data-shell-frame
      data-sub-shell-open={subShellOpen || undefined}
      className="relative flex h-screen flex-col overflow-hidden bg-grid-backdrop bg-background text-foreground"
    >
      <SkipToContent />
      <CollapsibleSidebarMarker
        value={{ inCollapsible: true, userCollapsed: visibleCollapsed }}
      >
        {/* Mobile-only topbar. Hidden at md+ via CSS. */}
        <MobileTopbarSkeleton subShellOpen={subShellOpen} />
        <div
          className={cn(
            "relative flex min-h-0 flex-1",
            visibleCollapsed
              ? "[--shell-left-w:var(--sidebar-rail-w)]"
              : "[--shell-left-w:var(--sidebar-w)]",
          )}
        >
          <div className="shell-pane-column hidden md:block">
            {subShellOpen ? (
              // Sub-shell hides footer entirely — matches UnifiedShell so the
              // skeleton → real-shell swap does not reflow.
              <Sidebar
                ariaLabel={subPane.ariaLabel}
                groups={subPane.groups}
                collapsed={visibleCollapsed}
                brand={<BrandRowSkeleton />}
                header={<ReturnHeaderSkeleton />}
              />
            ) : (
              <Sidebar
                ariaLabel="Workspace resources"
                groups={railGroups}
                collapsed={collapsed}
                brand={<BrandRowSkeleton />}
                header={<WorkspaceSwitcherSkeleton />}
                footer={footerSkeleton}
              />
            )}
          </div>
          <main className="min-w-0 flex-1 overflow-y-auto">
            <RouteSpinner />
          </main>
        </div>
      </CollapsibleSidebarMarker>
    </div>
  );
}

interface MobileTopbarSkeletonProps {
  subShellOpen: boolean;
}

function MobileTopbarSkeleton({ subShellOpen }: MobileTopbarSkeletonProps) {
  return (
    <header
      className={cn("shell-topbar", subShellOpen && "shell-topbar-sub")}
    >
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
        {!subShellOpen && (
          <span data-slot="ws">
            <MobileWorkspaceSwitcherSkeleton />
          </span>
        )}
      </div>
      <div data-zone="center">
        <MobileSearchTriggerSkeleton />
      </div>
      <div data-zone="right">
        <MobileIdentityClusterSkeleton />
      </div>
    </header>
  );
}

function BrandRowSkeleton() {
  const isRail = useIsSidebarRail();
  const searchIcon = (
    <span
      role="presentation"
      aria-hidden="true"
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground"
    >
      <Search className="size-4" />
    </span>
  );
  const toggle = (
    <span
      role="presentation"
      aria-hidden="true"
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground"
    >
      <PanelLeft className="size-5" />
    </span>
  );
  if (isRail) {
    return <div className="flex justify-center">{toggle}</div>;
  }
  return (
    <div className="flex h-8 items-center gap-1">
      <div className="flex min-w-0 flex-1 items-center">
        <BrandMark />
      </div>
      {searchIcon}
      {toggle}
    </div>
  );
}

function WorkspaceSwitcherSkeleton() {
  const isRail = useIsSidebarRail();
  return (
    <div
      role="presentation"
      className={cn(
        "flex min-w-0 max-w-full items-center rounded-md border border-transparent typography-label font-medium text-foreground",
        isRail
          ? "size-8 mx-auto justify-center"
          : "w-full gap-1.5 px-2 py-1",
      )}
    >
      <Boxes
        aria-hidden="true"
        className={cn("shrink-0 text-meta-foreground", isRail ? "size-5" : "size-4")}
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

function FooterIconStripSkeleton() {
  const isRail = useIsSidebarRail();
  return (
    <div
      role="presentation"
      className={cn(
        "flex items-center gap-1 border-b border-sidebar-border pb-2",
        isRail ? "flex-col" : "justify-around",
      )}
    >
      {[BookOpen, HelpCircle, Bell].map((Icon, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground"
        >
          <Icon className="size-5" />
        </span>
      ))}
    </div>
  );
}

function UserChipSkeleton() {
  const isRail = useIsSidebarRail();
  return (
    <div
      role="presentation"
      className={cn(
        "flex items-center rounded-md",
        isRail ? "size-8 mx-auto justify-center" : "w-full gap-2 px-2 py-1.5",
      )}
    >
      <Avatar size="sm">
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
      {!isRail && (
        <>
          <Skeleton className="h-3 min-w-0 flex-1 rounded-sm" />
          <ChevronsUpDown
            aria-hidden="true"
            className="size-4 shrink-0 text-meta-foreground"
          />
        </>
      )}
    </div>
  );
}

function MobileWorkspaceSwitcherSkeleton() {
  return (
    <div
      role="presentation"
      className="flex min-w-0 max-w-full items-center rounded-md border border-border px-1.5 py-0.5 gap-1 typography-label font-medium text-foreground"
    >
      <Boxes
        aria-hidden="true"
        className="size-4 shrink-0 text-meta-foreground"
      />
      <Skeleton className="h-4 min-w-0 flex-1 rounded-sm" />
      <ChevronDown
        aria-hidden="true"
        className="size-4 shrink-0 text-meta-foreground"
      />
    </div>
  );
}

function MobileSearchTriggerSkeleton() {
  return (
    <div
      role="presentation"
      data-slot="search"
      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground"
    >
      <Search className="size-4 shrink-0" aria-hidden="true" />
    </div>
  );
}

function MobileIdentityClusterSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="size-8 rounded-md" />
      <Skeleton className="size-8 rounded-md" />
      <Skeleton className="size-8 rounded-full" />
    </div>
  );
}

function ReturnHeaderSkeleton() {
  const isRail = useIsSidebarRail();
  return (
    <div className="py-1">
      <div
        data-sub-shell-return
        aria-hidden="true"
        className={cn(
          "h-8 items-center gap-2 rounded-md",
          isRail ? "flex justify-center px-0" : "inline-flex px-2",
          "typography-body text-muted-foreground",
        )}
      >
        <ArrowLeft
          data-sub-shell-return-icon
          aria-hidden="true"
          className={cn("shrink-0", isRail ? "size-5" : "size-4")}
        />
        {!isRail && <Skeleton className="h-3 w-12 rounded-sm" />}
      </div>
    </div>
  );
}
