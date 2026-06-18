import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { workspaceApiKeyQueries } from "@/lib/query/workspace-api-keys";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { ApiKeysList } from "./_components/api-keys-list";

export const metadata: Metadata = {
  title: "API keys",
};

export default async function ApiKeysPage() {
  const { accountId, workspaceId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(workspaceApiKeyQueries.list(accountId, workspaceId));
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">API keys</h1>
        <p className="text-muted-foreground">Workspace-scoped keys for programmatic access.</p>
      </header>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ApiKeysList />
      </HydrationBoundary>
    </div>
  );
}
