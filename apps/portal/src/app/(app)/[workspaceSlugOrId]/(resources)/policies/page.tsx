import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { policyQueries } from "@/lib/query/policies";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { PoliciesView } from "./_components/policies-view";

export const metadata: Metadata = {
  title: "Policies",
};

export default async function PoliciesPage() {
  const { accountId, workspaceId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(policyQueries.list(accountId, workspaceId));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PoliciesView />
    </HydrationBoundary>
  );
}
