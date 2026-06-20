import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { requireSession } from "@/lib/auth/session";
import { findWorkspaceMembership } from "@/lib/mock/org";
import LastVisitedWorkspaceWriter from "@/lib/workspace/last-visited-writer";

// Workspace gate. Runs once per workspace navigation, before any child page.
//
// 1. Require an authenticated session (the (app) group-level layout is a no-op
//    today — gating happens here so that the existence check below can rely on
//    an authenticated identity).
// 2. Resolve the slug/id against the session's membership list. A miss could be
//    a non-existent workspace OR a workspace the user can't see. We don't
//    distinguish — both 404. (Leaking the existence of inaccessible workspaces
//    is a multi-tenant footgun.)
// 3. Record the audited slug as the user's last-visited workspace. The cookie
//    write goes through a Server Action (Server Components can't set cookies
//    during render), fired client-side via <LastVisitedWorkspaceWriter>.
interface LayoutProps {
  children: ReactNode;
  params: Promise<{ workspaceSlugOrId: string }>;
}

export default async function WorkspaceLayout({
  children,
  params,
}: LayoutProps) {
  await requireSession();
  const { workspaceSlugOrId } = await params;

  const membership = findWorkspaceMembership(workspaceSlugOrId);
  if (!membership) {
    notFound();
  }

  return (
    <>
      <LastVisitedWorkspaceWriter slug={membership.org.slug} />
      {children}
    </>
  );
}
