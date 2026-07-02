"use client";

import SandboxDetailTabs from "./sandbox-detail-tabs";

interface SandboxDetailStickyTabsProps {
  workspaceSlug: string;
  sandboxName: string;
}

/** Sticky wrapper around the sandbox detail tab strip per wireframe §7.1.
 *  Only the strip row sticks — the identity band above scrolls away. No
 *  bottom border in either state: the active-tab underline in the tab strip
 *  itself is the only horizontal rule, so a full-width border extending past
 *  the tabs into the toolbar reads as noise.
 *
 *  Top offset: `top-0` (below the sidebar-owned shell chrome on md+). The
 *  mobile topbar renders above `<main>` in the layout, not inside its
 *  scroll container, so `top-0` correctly pins to the top of the visible
 *  scroll viewport on both breakpoints — see wireframe §7.5 Q1. */
export default function SandboxDetailStickyTabs({
  workspaceSlug,
  sandboxName,
}: SandboxDetailStickyTabsProps) {
  return (
    <div className="sticky top-0 z-sticky -mx-4 flex items-center gap-2 bg-background px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 xl:-mx-20 xl:px-20">
      <div className="min-w-0 flex-1 overflow-x-auto">
        <SandboxDetailTabs
          workspaceSlug={workspaceSlug}
          sandboxName={sandboxName}
        />
      </div>
    </div>
  );
}
