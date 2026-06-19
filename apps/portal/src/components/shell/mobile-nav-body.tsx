"use client";

import type { ReactNode } from "react";
import SidebarNavItem from "@/components/shell/sidebar-nav-item";
import type { NavGroup } from "@/components/shell/nav-groups";

interface MobileNavBodyProps {
  ariaLabel: string;
  groups: ReadonlyArray<NavGroup>;
  onNavigate: () => void;
  header?: ReactNode;
}

export function MobileNavBody({
  ariaLabel,
  groups,
  onNavigate,
  header,
}: MobileNavBodyProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className="flex flex-col gap-4 overflow-y-auto px-2 py-3"
    >
      {header ? (
        <div className="flex flex-col gap-2 border-b border-border pb-3">
          {header}
        </div>
      ) : null}
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-0.5">
          <div className="px-2 pb-1 font-mono text-meta uppercase text-meta-foreground">
            {group.label}
          </div>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <li key={item.href}>
                <SidebarNavItem item={item} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
