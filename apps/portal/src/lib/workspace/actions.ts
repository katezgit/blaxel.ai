"use server";

import { findWorkspaceMembership } from "@/lib/mock/org";
import { setLastVisitedWorkspace } from "@/lib/workspace/last-visited";

// Re-audits the slug against the user's memberships before writing — a Server
// Action's transport is reachable by any authenticated client, so trusting the
// incoming string would let a rogue caller poison the cookie with a workspace
// they don't actually own.
export async function recordLastVisitedWorkspace(slug: string): Promise<void> {
  const membership = findWorkspaceMembership(slug);
  if (!membership) return;
  await setLastVisitedWorkspace(membership.org.slug);
}
