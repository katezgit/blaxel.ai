import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { workspaceIntegrationQueries } from "@/lib/query/workspace-integrations";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { resolveWorkspace } from "@/lib/mock/org";
import IntegrationsClient from "./_components/integrations-client";

export const metadata: Metadata = {
  title: "Workspace settings · Integrations",
};

interface PageProps {
  params: Promise<{ workspaceSlugOrId: string }>;
}

export default async function IntegrationsPage({ params }: PageProps) {
  const { workspaceSlugOrId } = await params;
  const workspace = resolveWorkspace(workspaceSlugOrId);
  const { accountId, workspaceId } = await getCurrentTenancy();
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(
      workspaceIntegrationQueries.list(accountId, workspaceId),
    ),
    queryClient.prefetchQuery(
      workspaceIntegrationQueries.connections(accountId, workspaceId),
    ),
  ]);

  return (
    <div className="mx-auto flex h-full w-full max-w-(--page-max-width) flex-col gap-6 px-4 pb-16 pt-6 md:px-6 lg:px-8 xl:px-20">
      <header className="page-header shrink-0">
        <h1 className="typography-display font-semibold text-foreground">
          Integrations
        </h1>
        <p className="text-muted-foreground">
          Connect model providers, MCP servers, and external tools to{" "}
          {workspace.name}.
        </p>
      </header>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <IntegrationsClient />
      </HydrationBoundary>
    </div>
  );
}
