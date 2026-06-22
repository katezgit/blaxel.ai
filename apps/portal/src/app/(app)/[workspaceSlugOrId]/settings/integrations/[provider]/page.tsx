import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { workspaceIntegrationQueries } from "@/lib/query/workspace-integrations";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import fetchWorkspaceIntegrations from "@/lib/mock/workspace-integrations";
import ConnectionsView from "./_components/connections-view";

export const metadata: Metadata = {
  title: "Workspace settings · Integration",
};

interface ProviderPageProps {
  params: Promise<{ workspaceSlugOrId: string; provider: string }>;
}

export default async function ProviderConnectionsPage({
  params,
}: ProviderPageProps) {
  const { provider } = await params;
  const { accountId, workspaceId } = await getCurrentTenancy();

  const integrations = await fetchWorkspaceIntegrations(accountId, workspaceId);
  const integration = integrations.find((i) => i.id === provider);
  if (!integration) notFound();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    workspaceIntegrationQueries.connections(accountId, workspaceId),
  );

  return (
    <div className="mx-auto flex h-full w-full max-w-(--page-max-width) flex-col gap-6 px-4 pb-16 pt-6 md:px-6 lg:px-8 xl:px-20">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ConnectionsView integration={integration} />
      </HydrationBoundary>
    </div>
  );
}
