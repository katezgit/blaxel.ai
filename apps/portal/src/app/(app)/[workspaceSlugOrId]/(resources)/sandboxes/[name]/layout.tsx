import type { ReactNode } from "react";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { sandboxQueries } from "@/lib/query/sandboxes";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import SandboxDetailLayoutClient from "./_components/sandbox-detail-layout-client";

interface SandboxDetailLayoutProps {
  children: ReactNode;
  params: Promise<{ workspaceSlugOrId: string; name: string }>;
}

export default async function SandboxDetailLayout({
  children,
  params,
}: SandboxDetailLayoutProps) {
  const [{ workspaceSlugOrId, name }, { accountId, workspaceId }] =
    await Promise.all([params, getCurrentTenancy()]);
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    sandboxQueries.detail(accountId, workspaceId, name),
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SandboxDetailLayoutClient
        workspaceSlug={workspaceSlugOrId}
        sandboxName={name}
      >
        {children}
      </SandboxDetailLayoutClient>
    </HydrationBoundary>
  );
}
