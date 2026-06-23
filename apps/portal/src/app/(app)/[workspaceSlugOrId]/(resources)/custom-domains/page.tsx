import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { customDomainQueries } from "@/lib/query/custom-domains";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import CustomDomainsView from "./_components/custom-domains-view";

export const metadata: Metadata = {
  title: "Custom domains",
};

export default async function CustomDomainsPage() {
  const { accountId, workspaceId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(customDomainQueries.list(accountId, workspaceId));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CustomDomainsView />
    </HydrationBoundary>
  );
}
