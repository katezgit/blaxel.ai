import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { sandboxQueries } from "@/lib/query/sandboxes";
import { volumeQueries } from "@/lib/query/volumes";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import CreateSandboxView from "./_components/create-sandbox-view";

export const metadata: Metadata = {
  title: "Create Sandbox",
};

interface CreateSandboxPageProps {
  params: Promise<{ workspaceSlugOrId: string }>;
}

export default async function CreateSandboxPage({
  params,
}: CreateSandboxPageProps) {
  const [{ workspaceSlugOrId }, { accountId, workspaceId }] = await Promise.all([
    params,
    getCurrentTenancy(),
  ]);
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(sandboxQueries.images(accountId, workspaceId)),
    queryClient.prefetchQuery(volumeQueries.list(accountId, workspaceId)),
  ]);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CreateSandboxView workspaceSlug={workspaceSlugOrId} />
    </HydrationBoundary>
  );
}
