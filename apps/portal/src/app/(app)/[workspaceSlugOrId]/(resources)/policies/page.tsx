import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { policyQueries } from "@/lib/query/policies";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { PoliciesList } from "./_components/policies-list";

export const metadata: Metadata = {
  title: "Policies",
};

export default async function PoliciesPage() {
  const { accountId, workspaceId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(policyQueries.list(accountId, workspaceId));
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="typography-display font-semibold text-foreground">Policies</h1>
        <p className="text-muted-foreground">Guardrails applied to agents and sandboxes in this workspace.</p>
      </header>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PoliciesList />
      </HydrationBoundary>
    </div>
  );
}
