import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { orgApiKeyQueries } from "@/lib/query/org-api-keys";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { ApiKeysClient } from "./_components";

export const metadata: Metadata = {
  title: "API keys",
};

export default async function ApiKeysPage() {
  const { accountId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(orgApiKeyQueries.list(accountId));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ApiKeysClient />
    </HydrationBoundary>
  );
}
