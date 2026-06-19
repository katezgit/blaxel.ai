"use client";

import { useEffect } from "react";

export const LAST_WORKSPACE_STORAGE_KEY = "portal:last-workspace-slug";

/**
 * Records the active workspace slug to localStorage so the account shell's
 * "Return to <workspace>" link can deep-link the user back where they were.
 * Called by the workspace + workspace-settings shells on mount and slug change.
 */
export function useLastWorkspaceTracker(workspaceSlug: string) {
  useEffect(() => {
    if (!workspaceSlug) return;
    window.localStorage.setItem(LAST_WORKSPACE_STORAGE_KEY, workspaceSlug);
  }, [workspaceSlug]);
}

/** Reads the slug written by useLastWorkspaceTracker. Returns null when unset. */
export function readLastWorkspaceSlug(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LAST_WORKSPACE_STORAGE_KEY);
}
