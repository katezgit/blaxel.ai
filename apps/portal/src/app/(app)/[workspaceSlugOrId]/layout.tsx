import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { requireSession } from "@/lib/auth/session";
import { findWorkspaceMembership } from "@/lib/mock/org";
import LastVisitedWorkspaceWriter from "@/lib/workspace/last-visited-writer";

// A miss on findWorkspaceMembership could be a non-existent workspace OR one
// the signed-in user can't see — we don't distinguish, both 404. Leaking the
// existence of inaccessible workspaces is a multi-tenant footgun.
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
