import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { jobQueries } from "@/lib/query/jobs";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { JobsList } from "./_components/jobs-list";

export const metadata: Metadata = {
  title: "Jobs",
};

export default async function JobsPage() {
  const { accountId, workspaceId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(jobQueries.list(accountId, workspaceId));
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="typography-display font-semibold text-foreground">Jobs</h1>
        <p className="text-muted-foreground">Batch and scheduled runs in this workspace.</p>
      </header>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <JobsList />
      </HydrationBoundary>
    </div>
  );
}
