import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { policyQueries } from "@/lib/query/policies";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { PolicyDetailView } from "./_components/policy-detail-view";

export const metadata: Metadata = {
  title: "Policy",
};

interface PolicyDetailPageProps {
  params: Promise<{ workspaceSlugOrId: string; name: string }>;
}

export default async function PolicyDetailPage({ params }: PolicyDetailPageProps) {
  const [{ workspaceSlugOrId, name }, { accountId, workspaceId }] = await Promise.all([
    params,
    getCurrentTenancy(),
  ]);
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(policyQueries.detail(accountId, workspaceId, name)),
    queryClient.prefetchQuery(policyQueries.usages(accountId, workspaceId, name)),
  ]);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PolicyDetailView workspaceSlug={workspaceSlugOrId} policyName={name} />
    </HydrationBoundary>
  );
}
