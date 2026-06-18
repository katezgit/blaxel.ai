import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { orgQueries } from "@/lib/query/org";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { OrganizationView } from "./_components";

export const metadata: Metadata = {
  title: "Organization",
};

export default async function OrganizationPage() {
  const { accountId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(orgQueries.account(accountId)),
    queryClient.prefetchQuery(orgQueries.address(accountId)),
  ]);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrganizationView />
    </HydrationBoundary>
  );
}
