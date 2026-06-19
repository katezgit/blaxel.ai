import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { sandboxQueries } from "@/lib/query/sandboxes";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { SandboxesList } from "./_components/sandboxes-list";

export const metadata: Metadata = {
  title: "Sandboxes",
};

export default async function SandboxesPage() {
  const { accountId, workspaceId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(sandboxQueries.list(accountId, workspaceId));
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">Sandboxes</h1>
        <p className="text-muted-foreground">Secure compute on standby.</p>
      </header>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SandboxesList />
      </HydrationBoundary>
    </div>
  );
}
