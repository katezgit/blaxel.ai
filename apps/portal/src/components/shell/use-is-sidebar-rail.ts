"use client";

import { createContext, useContext, useEffect, useState } from "react";

const RAIL_QUERY = "(min-width: 768px) and (max-width: 1023px)";

interface CollapsibleSidebarValue {
  /** Inside a responsive sidebar (true on the desktop <aside>, false in the mobile drawer). */
  inCollapsible: boolean;
  /** User-driven collapse from ⌘B / toggle. Forces rail even at lg+. */
  userCollapsed: boolean;
}

const InCollapsibleSidebarContext = createContext<CollapsibleSidebarValue>({
  inCollapsible: false,
  userCollapsed: false,
});

export const CollapsibleSidebarMarker = InCollapsibleSidebarContext.Provider;

export function useViewportIsRailWidth() {
  const [isRail, setIsRail] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(RAIL_QUERY);
    setIsRail(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsRail(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isRail;
}

export function useIsSidebarRail() {
  const { inCollapsible, userCollapsed } = useContext(InCollapsibleSidebarContext);
  const viewportIsRail = useViewportIsRailWidth();
  return inCollapsible && (userCollapsed || viewportIsRail);
}
