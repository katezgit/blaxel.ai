"use server";

import { findWorkspaceMembership } from "@/lib/mock/org";
import { setLastVisitedWorkspace } from "@/lib/workspace/last-visited";

// Server Action wrapper around setLastVisitedWorkspace. Exists because Server
// Components can't write cookies during render (Next.js limitation) — the
// workspace layout renders <LastVisitedWorkspaceWriter> which calls this on
// mount. Re-audits the slug against the session's memberships so a tampered
// client can't poison the cookie with a slug the user doesn't actually own.
export async function recordLastVisitedWorkspace(slug: string): Promise<void> {
  const membership = findWorkspaceMembership(slug);
  if (!membership) return;
  await setLastVisitedWorkspace(membership.org.slug);
}
