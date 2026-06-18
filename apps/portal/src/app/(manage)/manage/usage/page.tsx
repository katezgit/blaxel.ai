import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { creditQueries } from "@/lib/query/credits";
import { limitQueries } from "@/lib/query/limits";
import { usageQueries } from "@/lib/query/usage";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { UsageView } from "./_components";

export const metadata: Metadata = {
  title: "Usage",
};

export default async function UsagePage() {
  const { accountId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(creditQueries.state(accountId)),
    queryClient.prefetchQuery(creditQueries.burn(accountId)),
    queryClient.prefetchQuery(limitQueries.list(accountId)),
    queryClient.prefetchQuery(usageQueries.list(accountId)),
  ]);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsageView />
    </HydrationBoundary>
  );
}
