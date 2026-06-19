"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import { SidebarNavItem } from "@/components/shell/sidebar-nav-item";
import { useIsSidebarRail } from "@/components/shell/use-is-sidebar-rail";
import type { NavGroup } from "@/components/shell/nav-groups";

interface SidebarProps {
  ariaLabel: string;
  groups: ReadonlyArray<NavGroup>;
  header?: ReactNode;
  collapsed?: boolean;
  onToggle?: () => void;
  /** False during the initial mount paint — suppresses the width transition
   * on shell remount (e.g. switching workspaces while collapsed). */
  transitionEnabled?: boolean;
}

export function Sidebar({ ariaLabel, groups, header, collapsed = false, onToggle, transitionEnabled = false }: SidebarProps) {
  const isRail = useIsSidebarRail();

  return (
    <aside
      aria-label={ariaLabel}
      style={{ viewTransitionName: "shell-sidebar" }}
      className={cn(
        "relative hidden shrink-0 border-r border-border bg-background md:block",
        transitionEnabled && "transition-[width] duration-subtle ease-out-standard",
        collapsed ? "lg:w-(--sidebar-rail-w)" : "lg:w-(--sidebar-w)",
        "md:w-(--sidebar-rail-w)",
      )}
    >
      <nav
        aria-label={ariaLabel}
        data-rail={isRail || undefined}
        className="flex h-full flex-col gap-4 overflow-y-auto overflow-x-hidden px-2 py-3"
      >
        {header ? (
          <div data-sidebar-header className="flex flex-col gap-2 border-b border-border pb-3">
            {header}
          </div>
        ) : null}
        {groups.map((group) => (
          <div key={group.label} data-nav-group className="flex flex-col gap-0.5">
            <div
              data-group-label
              className="px-2 pb-1 font-mono text-meta uppercase text-meta-foreground"
            >
              {group.label}
            </div>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <SidebarNavItem item={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      {onToggle ? (
        <button
          type="button"
          onClick={onToggle}
          aria-label={isRail ? "Expand sidebar (⌘B)" : "Collapse sidebar (⌘B)"}
          aria-pressed={isRail}
          className="absolute top-4 -right-3 z-10 hidden size-6 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-meta-foreground shadow-card transition hover:text-foreground hover:bg-secondary-surface focus-visible:shadow-focus-ring lg:inline-flex"
        >
          {isRail ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
        </button>
      ) : null}
    </aside>
  );
}
