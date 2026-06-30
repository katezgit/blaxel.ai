import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { sandboxQueries } from "@/lib/query/sandboxes";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import SandboxDetailView from "./_components/sandbox-detail-view";

export const metadata: Metadata = {
  title: "Sandbox",
};

interface SandboxDetailPageProps {
  params: Promise<{ workspaceSlugOrId: string; name: string }>;
}

export default async function SandboxDetailPage({
  params,
}: SandboxDetailPageProps) {
  const [{ workspaceSlugOrId, name }, { accountId, workspaceId }] =
    await Promise.all([params, getCurrentTenancy()]);
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    sandboxQueries.detail(accountId, workspaceId, name),
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SandboxDetailView workspaceSlug={workspaceSlugOrId} sandboxName={name} />
    </HydrationBoundary>
  );
}
