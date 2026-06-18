import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { mcpServerQueries } from "@/lib/query/mcp-servers";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { McpServersList } from "./_components/mcp-servers-list";

export const metadata: Metadata = {
  title: "MCP servers",
};

export default async function McpServersPage() {
  const { accountId, workspaceId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(mcpServerQueries.list(accountId, workspaceId));
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">MCP servers</h1>
        <p className="text-muted-foreground">Tool servers exposed to your agents.</p>
      </header>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <McpServersList />
      </HydrationBoundary>
    </div>
  );
}
