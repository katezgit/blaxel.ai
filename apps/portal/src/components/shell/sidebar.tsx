"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import SidebarNavItem from "@/components/shell/sidebar-nav-item";
import { useIsSidebarRail } from "@/components/shell/use-is-sidebar-rail";
import type { NavGroup } from "@/components/shell/nav-groups";

interface SidebarProps {
  ariaLabel: string;
  groups: ReadonlyArray<NavGroup>;
  header?: ReactNode;
  collapsed?: boolean;
  onToggle?: () => void;
}

// Width transition is owned by the wrapper CSS in globals.css (.shell-rail).
// Asymmetric timing (open/close uses different duration tokens) is keyed off
// data-sub-shell-open on the shell frame, which the Sidebar primitive does
// not know about — keep the primitive transition-agnostic.
export function Sidebar({ ariaLabel, groups, header, collapsed = false, onToggle }: SidebarProps) {
  const isRail = useIsSidebarRail();

  return (
    <aside
      aria-label={ariaLabel}
      className={cn(
        "relative h-full shrink-0 border-r border-sidebar-border bg-sidebar",
        collapsed ? "lg:w-(--sidebar-rail-w)" : "lg:w-(--sidebar-w)",
        "md:w-(--sidebar-rail-w)",
      )}
    >
      <nav
        aria-label={ariaLabel}
        data-rail={isRail || undefined}
        className={cn(
          "flex h-full flex-col gap-4 overflow-y-auto overflow-x-hidden px-2 pb-3",
          header ? "pt-0" : "pt-3",
        )}
      >
        {header}
        {groups.map((group) => (
          <div key={group.label} data-nav-group className="flex flex-col gap-0.5">
            <div
              data-group-label
              className="px-2 pb-1 font-mono typography-meta uppercase text-meta-foreground"
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
          // Centered vertically on the first sidebar row — Back in sub-shells,
          // the first section label in the main shell. Both rows' centerlines
          // land at ~y=20 inside the sidebar (sub-shell: pt-1 wrapper + h-8
          // row → center at 4+16=20; main shell: pt-3 + small label, center
          // ~20), so a single top-5 value rides both.
          className="absolute top-5 -right-3 z-10 hidden size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-sidebar text-meta-foreground shadow-card transition before:absolute before:-inset-1 before:content-[''] hover:text-foreground hover:bg-secondary-surface focus-visible:shadow-focus-ring lg:inline-flex"
        >
          {isRail ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
        </button>
      ) : null}
    </aside>
  );
}
