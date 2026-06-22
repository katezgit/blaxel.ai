import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { agentDriveQueries } from "@/lib/query/agent-drive";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { AgentDriveList } from "./_components/agent-drive-list";

export const metadata: Metadata = {
  title: "Agent Drive",
};

export default async function AgentDrivePage() {
  const { accountId, workspaceId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(agentDriveQueries.list(accountId, workspaceId));
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="typography-display font-semibold text-foreground">Agent Drive</h1>
        <p className="text-muted-foreground">Shared workspace file system for your agents.</p>
      </header>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AgentDriveList />
      </HydrationBoundary>
    </div>
  );
}
