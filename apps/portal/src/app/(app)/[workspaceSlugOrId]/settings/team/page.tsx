import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { workspaceTeamQueries } from "@/lib/query/workspace-team";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { resolveWorkspace } from "@/lib/mock/org";
import TeamClient from "./_components/team-client";

export const metadata: Metadata = {
  title: "Workspace settings · Team",
};

interface PageProps {
  params: Promise<{ workspaceSlugOrId: string }>;
}

export default async function WorkspaceTeamPage({ params }: PageProps) {
  const { workspaceSlugOrId } = await params;
  const workspace = resolveWorkspace(workspaceSlugOrId);
  const { accountId, workspaceId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    workspaceTeamQueries.list(accountId, workspaceId),
  );

  return (
    <div className="page-shell">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <TeamClient workspace={workspace} />
      </HydrationBoundary>
    </div>
  );
}
