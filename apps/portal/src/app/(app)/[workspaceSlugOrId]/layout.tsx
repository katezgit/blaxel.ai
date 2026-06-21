import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { WorkspaceShell } from "@/components/shell/workspace-shell";
import { WorkspaceShellSkeleton } from "@/components/shell/workspace-shell-skeleton";
import { requireSession } from "@/lib/auth/session";
import { findWorkspaceMembership } from "@/lib/mock/org";
import { getQueryClient } from "@/lib/query/get-query-client";
import { orgQueries } from "@/lib/query/org";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { TenancyProvider } from "@/lib/query/tenancy-context";
import LastVisitedWorkspaceWriter from "@/lib/workspace/last-visited-writer";

// Sync outer layout — async data resolution moves into WorkspaceShellHost
// behind a Suspense boundary so cross-shell entries paint the workspace
// skeleton chrome (sidebar + topbar shape, URL-derived nav) immediately
// while session/tenancy/workspace data resolves in parallel. The skeleton
// reuses the same ShellFrame primitive the real shell consumes, so the
// swap from skeleton -> real shell can't reflow. Within-workspace
// transitions (resources <-> settings, same slug) re-use the resolved
// host — Suspense fallback fires only when the host's deps change, which
// is exactly the cross-shell / cross-workspace cases.

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ workspaceSlugOrId: string }>;
}

export default function WorkspaceLayout({ children, params }: LayoutProps) {
  return (
    <Suspense fallback={<WorkspaceShellSkeleton />}>
      <WorkspaceShellHost params={params}>{children}</WorkspaceShellHost>
    </Suspense>
  );
}

const ACCOUNT_TIER = "Tier 1";

interface WorkspaceShellHostProps {
  children: ReactNode;
  params: Promise<{ workspaceSlugOrId: string }>;
}

// A miss on findWorkspaceMembership could be a non-existent workspace OR
// one the signed-in user can't see — we don't distinguish, both 404.
// Leaking the existence of inaccessible workspaces is a multi-tenant
// footgun.
async function WorkspaceShellHost({ children, params }: WorkspaceShellHostProps) {
  // Permission gate only — session + workspace membership. Tenancy and
  // workspace-list prefetches are NOT part of the gate; they ride the
  // child Suspense boundary so the gate fires only on the permission
  // check, not on every downstream account/workspace fetch.
  const [session, { workspaceSlugOrId }] = await Promise.all([
    requireSession(),
    params,
  ]);
  const currentOrg = findWorkspaceMembership(workspaceSlugOrId)?.org;
  if (!currentOrg) notFound();

  const user = {
    name: session.name || "User",
    email: session.email,
    tier: ACCOUNT_TIER,
  };

  return (
    <WorkspaceShellData currentOrg={currentOrg} user={user}>
      {children}
    </WorkspaceShellData>
  );
}

interface WorkspaceShellDataProps {
  children: ReactNode;
  currentOrg: NonNullable<ReturnType<typeof findWorkspaceMembership>>["org"];
  user: { name: string; email: string; tier: string };
}

async function WorkspaceShellData({
  children,
  currentOrg,
  user,
}: WorkspaceShellDataProps) {
  const tenancy = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(orgQueries.account(tenancy.accountId)),
    queryClient.prefetchQuery(orgQueries.accounts()),
  ]);
  const memberships = await queryClient.ensureQueryData(orgQueries.accounts());
  const workspaces = memberships.map((m) => m.org);

  return (
    <TenancyProvider value={tenancy}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <LastVisitedWorkspaceWriter slug={currentOrg.slug} />
        <WorkspaceShell
          currentOrg={currentOrg}
          workspaces={workspaces}
          user={user}
        >
          {children}
        </WorkspaceShell>
      </HydrationBoundary>
    </TenancyProvider>
  );
}
