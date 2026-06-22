import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { agentQueries } from "@/lib/query/agents";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { AgentsList } from "./_components/agents-list";

export const metadata: Metadata = {
  title: "Agents",
};

export default async function AgentsPage() {
  const { accountId, workspaceId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(agentQueries.list(accountId, workspaceId));
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="typography-display font-semibold text-foreground">Agents</h1>
        <p className="text-muted-foreground">Hosted agents running on the platform.</p>
      </header>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AgentsList />
      </HydrationBoundary>
    </div>
  );
}
