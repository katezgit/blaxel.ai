import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { memberQueries } from "@/lib/query/members";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { MembersView } from "./_components";

export const metadata: Metadata = {
  title: "Members",
};

export default async function MembersPage() {
  const { accountId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  // Both tiers are prefetched because role flips client-side (mock role switcher),
  // so either branch may render without an extra round trip.
  await Promise.all([
    queryClient.prefetchQuery(memberQueries.list(accountId)),
    queryClient.prefetchQuery(memberQueries.listForUserTier(accountId)),
  ]);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MembersView />
    </HydrationBoundary>
  );
}
