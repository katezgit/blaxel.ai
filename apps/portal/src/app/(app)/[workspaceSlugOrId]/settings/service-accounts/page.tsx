import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { workspaceServiceAccountQueries } from "@/lib/query/workspace-service-accounts";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { resolveWorkspace } from "@/lib/mock/org";
import ServiceAccountsClient from "./_components/service-accounts-client";

export const metadata: Metadata = {
  title: "Workspace settings · Service accounts",
};

interface PageProps {
  params: Promise<{ workspaceSlugOrId: string }>;
}

export default async function ServiceAccountsPage({ params }: PageProps) {
  const { workspaceSlugOrId } = await params;
  const workspace = resolveWorkspace(workspaceSlugOrId);
  const { accountId, workspaceId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    workspaceServiceAccountQueries.list(accountId, workspaceId),
  );

  return (
    <div className="page-shell">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ServiceAccountsClient workspace={workspace} />
      </HydrationBoundary>
    </div>
  );
}
