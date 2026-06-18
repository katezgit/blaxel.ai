import type { ReactNode } from "react";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import ManageShell from "@/app/(manage)/_components/manage-shell";
import { requireSession } from "@/lib/auth/session";
import { getQueryClient } from "@/lib/query/get-query-client";
import { orgQueries } from "@/lib/query/org";
import { userQueries } from "@/lib/query/user";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { TenancyProvider } from "@/lib/query/tenancy-context";

export default async function ManageRootLayout({ children }: { children: ReactNode }) {
  const [session, tenancy] = await Promise.all([
    requireSession(),
    getCurrentTenancy(),
  ]);

  // Shell + child pages share the active account; user profile is referenced by
  // both the shell fallback and the profile form.
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(orgQueries.account(tenancy.accountId)),
    queryClient.prefetchQuery(userQueries.current()),
  ]);

  return (
    <TenancyProvider value={tenancy}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ManageShell email={session.email} name={session.name}>
          {children}
        </ManageShell>
      </HydrationBoundary>
    </TenancyProvider>
  );
}
