"use client";

import type { ReactNode } from "react";
import { cn } from "@repo/ui/lib/cn";
import SidebarNavItem from "@/components/shell/sidebar-nav-item";
import { useIsSidebarRail } from "@/components/shell/use-is-sidebar-rail";
import type { NavGroup } from "@/components/shell/nav-groups";

interface SidebarProps {
  ariaLabel: string;
  groups: ReadonlyArray<NavGroup>;
  /** Zone A row 1 — brand + search + collapse chevron. */
  brand?: ReactNode;
  /** Zone A row 2 — WorkspaceSwitcher on main routes, or Back link on
   * sub-shell routes. Sits above the Zone A/B hairline. */
  header?: ReactNode;
  /** Top of Zone B — content rendered inside the nav container above the
   * groups. Used for the sub-shell identity chip so the hairline separates
   * `Back` (chrome) from the chip (nav content). */
  preNav?: ReactNode;
  /** Zone C + D — footer icon strip stacked on top of the identity chip. */
  footer?: ReactNode;
  collapsed?: boolean;
}

// Full-viewport-height at md+. Four vertical zones inside the aside:
// Zone A top (brand row + header row), Zone B middle (nav — scrollable if
// overflow), Zone C+D bottom (footer icon strip + user chip). Width
// transition is owned by the wrapper CSS in globals.css (.shell-pane-column).
// Slide-in animation lives on the keyed wrapper around this primitive in
// <UnifiedShell> — keep the primitive transition-agnostic.
export function Sidebar({
  ariaLabel,
  groups,
  brand,
  header,
  preNav,
  footer,
  collapsed = false,
}: SidebarProps) {
  const isRail = useIsSidebarRail();

  return (
    <aside
      aria-label={ariaLabel}
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar",
        collapsed ? "lg:w-(--sidebar-rail-w)" : "lg:w-(--sidebar-w)",
        "md:w-(--sidebar-rail-w)",
      )}
    >
      {/* Zone A: brand row + header row. Fixed height, does not scroll.
       * gap-2 keeps the two rows visually distinct without feeling stacked.
       * Hairline bottom-border separates Zone A from Zone B (nav) — pb-1.5
       * keeps the hairline close under the header row so sub-shell Back rows
       * don't inflate dead vertical space above the identity chip. */}
      {(brand || header) && (
        <div className="flex flex-col gap-2 border-b border-sidebar-border px-2 pt-3 pb-1.5">
          {brand}
          {header}
        </div>
      )}
      {/* Middle zone: nav. Grows to fill remaining height, scrolls internally
       * if the group list overflows. */}
      <nav
        aria-label={ariaLabel}
        data-rail={isRail || undefined}
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden px-2 pt-3 pb-2",
        )}
      >
        {preNav}
        {groups.map((group, index) => (
          <div
            key={group.label || `group-${index}`}
            data-nav-group
            className="flex flex-col gap-0.5"
          >
            {group.label ? (
              <div
                data-group-label
                className="px-2 typography-caption text-meta-foreground"
              >
                {group.label}
              </div>
            ) : null}
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
      {/* Bottom zone: footer. Fixed at viewport-bottom, hairline separator
       * against the nav. Empty in mobile drawer (not passed). */}
      {footer && (
        <div
          data-sidebar-footer
          data-rail={isRail || undefined}
          className="flex flex-col gap-2 border-t border-sidebar-border px-2 py-2"
        >
          {footer}
        </div>
      )}
    </aside>
  );
}
