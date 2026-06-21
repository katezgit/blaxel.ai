"use client";

import type { ReactNode } from "react";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import { SkipToContent } from "@/components/shell/skip-to-content";
import { CollapsibleSidebarMarker } from "@/components/shell/use-is-sidebar-rail";

interface ShellFrameProps {
  topbar: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
  /** Persisted user-driven collapse from ⌘B. Drives sidebar rail width. */
  collapsed: boolean;
}

// Shared shape primitive for real shells AND skeleton boundaries. Owns the
// flex column wrapper, --shell-left-w token override, SkipToContent, tooltip
// provider, and the sidebar-rail marker context. Real-vs-skeleton differ only
// in what they pass into `topbar` / `sidebar` / `children` — the chrome shape
// is locked in here so the swap from skeleton -> real layout doesn't reflow.
export function ShellFrame({
  topbar,
  sidebar,
  children,
  collapsed,
}: ShellFrameProps) {
  return (
    <TooltipProvider>
      <div
        data-shell-frame
        className={cn(
          "flex h-screen flex-col overflow-hidden text-foreground",
          collapsed && "[--shell-left-w:var(--sidebar-rail-w)]",
        )}
      >
        <SkipToContent />
        <CollapsibleSidebarMarker
          value={{ inCollapsible: true, userCollapsed: collapsed }}
        >
          {topbar}
          <div className="flex min-h-0 flex-1">
            {sidebar}
            <main
              id="main-content"
              className="min-w-0 flex-1 overflow-y-auto bg-grid-backdrop bg-panel"
            >
              {children}
            </main>
          </div>
        </CollapsibleSidebarMarker>
      </div>
    </TooltipProvider>
  );
}
