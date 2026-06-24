"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Org } from "@/lib/mock/types";

// The current workspace is resolved by (app)/[workspaceSlugOrId]/layout.tsx
// (server) and pushed into the already-mounted UnifiedShell (client) via this
// context. Carrying it through context — instead of remounting the shell with
// it as a prop — is what lets the rail <aside> persist as the SAME DOM node
// across /{slug} ↔ /profile and /{slug} ↔ /account (the constraint that makes
// the CSS slide play).
//
// Null on sub-shell routes (/profile/*, /account/*) — those rely on the last-
// visited tracker, not the URL, to pick a fallback for the "Return to <ws>" link.
const ActiveWorkspaceContext = createContext<Org | null>(null);

export function ActiveWorkspaceProvider({
  workspace,
  children,
}: {
  workspace: Org;
  children: ReactNode;
}) {
  return (
    <ActiveWorkspaceContext.Provider value={workspace}>
      {children}
    </ActiveWorkspaceContext.Provider>
  );
}

export function useActiveWorkspace(): Org | null {
  return useContext(ActiveWorkspaceContext);
}
