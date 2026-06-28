import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ActiveWorkspaceProvider } from "@/components/shell/workspace-context";
import { requireSession } from "@/lib/auth/session";
import { findWorkspaceMembership } from "@/lib/mock/org";
import LastVisitedWorkspaceWriter from "@/lib/workspace/last-visited-writer";

// Workspace-scoped layout under the unified shell. The shell itself is
// mounted higher up by (app)/layout.tsx — this layout only resolves the
// active workspace, gates inaccessible/non-existent ones with notFound(),
// and pushes the resolved Org into context so the already-mounted shell
// can render the right workspace name in the topbar switcher + sub-shell
// return header.
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
    <ActiveWorkspaceProvider workspace={currentOrg}>
      <LastVisitedWorkspaceWriter slug={currentOrg.slug} />
      {children}
    </ActiveWorkspaceProvider>
  );
}
