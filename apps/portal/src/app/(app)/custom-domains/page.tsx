import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { customDomainQueries } from "@/lib/query/custom-domains";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { CustomDomainsList } from "./_components/custom-domains-list";

export const metadata: Metadata = {
  title: "Custom domains",
};

export default async function CustomDomainsPage() {
  const { accountId, workspaceId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(customDomainQueries.list(accountId, workspaceId));
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">Custom domains</h1>
        <p className="text-muted-foreground">Custom DNS routes pointing at your hosted resources.</p>
      </header>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CustomDomainsList />
      </HydrationBoundary>
    </div>
  );
}
