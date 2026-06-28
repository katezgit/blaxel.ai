import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { requireSession } from "@/lib/auth/session";
import { findWorkspaceMembership } from "@/lib/mock/org";
import LastVisitedWorkspaceWriter from "@/lib/workspace/last-visited-writer";

// Workspace-scoped layout under the unified shell. The shell itself is
// mounted higher up by (app)/layout.tsx — this layout only gates inaccessible
// or non-existent workspaces with notFound() and writes the slug to the
// last-visited tracker. The shell resolves the active workspace directly from
// the URL pathname (see UnifiedShell), so no context is needed here.
//
// Sub-shell routes (/profile/*, /account/*) do NOT pass through this layout —
// they read the last-visited workspace from localStorage via the shell.
//
// MOTION (B6 — keep-instant): route changes inside this layout must NOT fade
// or slide the content area. The shell persists across workspace routes; the
// only visible loading signal is the skeleton shimmer on new data. Adding an
// enter animation here delays Alex's orientation signal and turns navigation
// (a structural already-confirmed event) into ceremony. See
// docs/design/foundations/motion-application.md §B6.

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ workspaceSlugOrId: string }>;
}

export default async function WorkspaceLayout({
  children,
  params,
}: LayoutProps) {
  // requireSession() runs once at (app)/layout.tsx for the data layer; we
  // re-verify here because the permission gate (membership) needs the
  // session-bound user. A miss on findWorkspaceMembership could be a
  // non-existent workspace OR one the signed-in user can't see — either way
  // 404; leaking the existence of inaccessible workspaces is a multi-tenant
  // footgun.
  await requireSession();
  const { workspaceSlugOrId } = await params;
  const currentOrg = findWorkspaceMembership(workspaceSlugOrId)?.org;
  if (!currentOrg) notFound();

  return (
    <>
      <LastVisitedWorkspaceWriter slug={currentOrg.slug} />
      {children}
    </>
  );
}
