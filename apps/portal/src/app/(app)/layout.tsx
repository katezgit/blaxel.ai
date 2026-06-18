import type { ReactNode } from "react";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { requireSession } from "@/lib/auth/session";
import AppShell from "@/components/shell/app-shell";
import { getQueryClient } from "@/lib/query/get-query-client";
import { orgQueries } from "@/lib/query/org";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { TenancyProvider } from "@/lib/query/tenancy-context";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const [session, tenancy] = await Promise.all([
    requireSession(),
    getCurrentTenancy(),
  ]);

  // Shell reads the active account; prefetch here so AvatarMenu has data on
  // first paint. Cascade root is `account(accountId)` — every domain that the
  // shell + pages depend on shares this prefix.
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(orgQueries.account(tenancy.accountId));

  return (
    <TenancyProvider value={tenancy}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AppShell email={session.email} name={session.name}>
          {children}
        </AppShell>
      </HydrationBoundary>
    </TenancyProvider>
  );
}
