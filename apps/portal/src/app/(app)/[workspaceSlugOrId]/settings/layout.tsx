import type { ReactNode } from "react";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { requireSession } from "@/lib/auth/session";
import { WorkspaceSettingsShell } from "@/components/shell/workspace-settings-shell";
import { getQueryClient } from "@/lib/query/get-query-client";
import { orgQueries } from "@/lib/query/org";
import { resolveWorkspace } from "@/lib/mock/org";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { TenancyProvider } from "@/lib/query/tenancy-context";

const NOTIFICATIONS_UNREAD = 3;
const ACCOUNT_TIER = "Tier 1";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ workspaceSlugOrId: string }>;
}

export default async function WorkspaceSettingsLayout({
  children,
  params,
}: LayoutProps) {
  const [session, tenancy, { workspaceSlugOrId }] = await Promise.all([
    requireSession(),
    getCurrentTenancy(),
    params,
  ]);

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(orgQueries.account(tenancy.accountId)),
    queryClient.prefetchQuery(orgQueries.accounts()),
  ]);

  const currentOrg = resolveWorkspace(workspaceSlugOrId);

  const user = {
    name: session.name || "User",
    email: session.email,
    tier: ACCOUNT_TIER,
  };

  return (
    <TenancyProvider value={tenancy}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <WorkspaceSettingsShell
          currentOrg={currentOrg}
          user={user}
          unreadNotifications={NOTIFICATIONS_UNREAD}
        >
          {children}
        </WorkspaceSettingsShell>
      </HydrationBoundary>
    </TenancyProvider>
  );
}
