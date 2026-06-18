import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { volumeQueries } from "@/lib/query/volumes";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { VolumesList } from "./_components/volumes-list";

export const metadata: Metadata = {
  title: "Volumes",
};

export default async function VolumesPage() {
  const { accountId, workspaceId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(volumeQueries.list(accountId, workspaceId));
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">Volumes</h1>
        <p className="text-muted-foreground">Persistent storage for sandboxes.</p>
      </header>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <VolumesList />
      </HydrationBoundary>
    </div>
  );
}
