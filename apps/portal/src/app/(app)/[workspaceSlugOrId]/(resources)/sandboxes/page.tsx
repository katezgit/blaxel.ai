import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { sandboxQueries } from "@/lib/query/sandboxes";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { SandboxesView } from "./_components/sandboxes-view";

export const metadata: Metadata = {
  title: "Sandboxes",
};

export default async function SandboxesPage() {
  const { accountId, workspaceId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(sandboxQueries.list(accountId, workspaceId));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SandboxesView />
    </HydrationBoundary>
  );
}
