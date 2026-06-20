import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { requireSession } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/shell/workspace-shell";
import { getQueryClient } from "@/lib/query/get-query-client";
import { orgQueries } from "@/lib/query/org";
import { findWorkspaceMembership } from "@/lib/mock/org";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { TenancyProvider } from "@/lib/query/tenancy-context";

const ACCOUNT_TIER = "Tier 1";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ workspaceSlugOrId: string }>;
}

export default async function WorkspaceResourcesLayout({
  children,
  params,
}: LayoutProps) {
  const [session, tenancy, { workspaceSlugOrId }] = await Promise.all([
    requireSession(),
    getCurrentTenancy(),
    params,
  ]);

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(orgQueries.account(tenancy.accountId)),
    queryClient.prefetchQuery(orgQueries.accounts()),
  ]);

  // Local strict resolve — the parent gate (workspaceSlugOrId/layout.tsx) already
  // 404s unknown slugs, but encoding the same audit here keeps the protection
  // local instead of relying on parent-runs-first ordering.
  const currentOrg = findWorkspaceMembership(workspaceSlugOrId)?.org;
  if (!currentOrg) notFound();
  const memberships = await queryClient.ensureQueryData(orgQueries.accounts());
  const workspaces = memberships.map((m) => m.org);

  const user = {
    name: session.name || "User",
    email: session.email,
    tier: ACCOUNT_TIER,
  };

  return (
    <TenancyProvider value={tenancy}>
      <HydrationBoundary state={dehydrate(queryClient)}>
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
