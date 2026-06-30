import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { ArrowUpRightIcon } from "lucide-react";
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
        <p className="typography-body text-muted-foreground">
          Reusable snapshots your Sandboxes fork from.{" "}
          <a
            href="https://docs.blaxel.ai/Sandboxes/Templates"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Sandbox images documentation, opens in new tab"
            className="inline-flex items-baseline gap-0.5 rounded-sm text-muted-foreground outline-hidden hover:text-foreground hover:underline focus-visible:shadow-focus-ring"
          >
            Docs
            <ArrowUpRightIcon aria-hidden="true" className="size-3 self-center" />
          </a>
          {" · "}
          <a
            href="https://docs.blaxel.ai/api-reference/images/list-container-images"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Images API reference, opens in new tab"
            className="inline-flex items-baseline gap-0.5 rounded-sm text-muted-foreground outline-hidden hover:text-foreground hover:underline focus-visible:shadow-focus-ring"
          >
            API reference
            <ArrowUpRightIcon aria-hidden="true" className="size-3 self-center" />
          </a>
        </p>
      </header>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ImagesList />
      </HydrationBoundary>
    </div>
  );
}
