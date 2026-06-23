import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { policyQueries } from "@/lib/query/policies";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { CreatePolicyView } from "./_components/create-policy-view";

export const metadata: Metadata = {
  title: "Create policy",
};

interface CreatePolicyPageProps {
  params: Promise<{ workspaceSlugOrId: string }>;
}

export default async function CreatePolicyPage({ params }: CreatePolicyPageProps) {
  const [{ workspaceSlugOrId }, { accountId, workspaceId }] = await Promise.all([
    params,
    getCurrentTenancy(),
  ]);
  // Prefetch the list so the cancel/save round-trip back to /policies hydrates
  // instantly. Duplicate prefill reads from the same cache via useQuery hook.
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(policyQueries.list(accountId, workspaceId));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CreatePolicyView workspaceSlug={workspaceSlugOrId} />
    </HydrationBoundary>
  );
}
