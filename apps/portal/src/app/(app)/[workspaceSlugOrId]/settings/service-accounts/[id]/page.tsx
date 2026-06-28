import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { workspaceServiceAccountQueries } from "@/lib/query/workspace-service-accounts";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { resolveWorkspace } from "@/lib/mock/org";
import ServiceAccountDetailView from "./_components/service-account-detail-view";

export const metadata: Metadata = {
  title: "Workspace settings · Service account",
};

interface PageProps {
  params: Promise<{ workspaceSlugOrId: string; id: string }>;
}

export default async function ServiceAccountDetailPage({ params }: PageProps) {
  const { workspaceSlugOrId, id } = await params;
  const workspace = resolveWorkspace(workspaceSlugOrId);
  const { accountId, workspaceId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    workspaceServiceAccountQueries.detail(accountId, workspaceId, id),
  );

  return (
    <div className="page-shell">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ServiceAccountDetailView workspace={workspace} serviceAccountId={id} />
      </HydrationBoundary>
    </div>
  );
}
