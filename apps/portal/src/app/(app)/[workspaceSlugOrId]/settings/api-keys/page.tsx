import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { workspaceApiKeyQueries } from "@/lib/query/workspace-api-keys";
import { workspaceTeamQueries } from "@/lib/query/workspace-team";
import { workspaceServiceAccountQueries } from "@/lib/query/workspace-service-accounts";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import ApiKeysClient from "./_components/api-keys-client";

export const metadata: Metadata = {
  title: "Workspace settings · API keys",
};

export default async function WorkspaceApiKeysPage() {
  const { accountId, workspaceId } = await getCurrentTenancy();

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(
      workspaceApiKeyQueries.list(accountId, workspaceId),
    ),
    queryClient.prefetchQuery(workspaceTeamQueries.list(accountId, workspaceId)),
    queryClient.prefetchQuery(
      workspaceServiceAccountQueries.list(accountId, workspaceId),
    ),
  ]);

  return (
    <div className="page-shell">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ApiKeysClient />
      </HydrationBoundary>
    </div>
  );
}
