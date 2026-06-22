import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { imageQueries } from "@/lib/query/images";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { ImagesList } from "./_components/images-list";

export const metadata: Metadata = {
  title: "Images",
};

export default async function ImagesPage() {
  const { accountId, workspaceId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(imageQueries.list(accountId, workspaceId));
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="typography-display font-semibold text-foreground">Images</h1>
        <p className="text-muted-foreground">Container images backing your sandboxes.</p>
      </header>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ImagesList />
      </HydrationBoundary>
    </div>
  );
}
