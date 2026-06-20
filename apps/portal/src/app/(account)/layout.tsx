import type { ReactNode } from "react";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { requireSession } from "@/lib/auth/session";
import AccountShell from "@/components/shell/account-shell";
import { getQueryClient } from "@/lib/query/get-query-client";
import { orgQueries } from "@/lib/query/org";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { TenancyProvider } from "@/lib/query/tenancy-context";

// Single auth/tenancy gate for both /profile/* and /account/*. AccountShell
// is a client component and discriminates its sidebar (Profile vs Account)
// from `usePathname()` — keeps the React-component icon refs out of the
// server-to-client serialization boundary.
const FALLBACK_USER_TIER = "Tier 0";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const [session, tenancy] = await Promise.all([
    requireSession(),
    getCurrentTenancy(),
  ]);

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(orgQueries.accounts());
  const memberships = await queryClient.ensureQueryData(orgQueries.accounts());
  const workspaces = memberships.map((m) => m.org);
  const fallbackWorkspace = workspaces[0] ?? memberships[0]?.org;

  if (!fallbackWorkspace) {
    throw new Error("Account shell requires at least one workspace membership.");
  }

  const user = {
    name: session.name || "User",
    email: session.email,
    tier: FALLBACK_USER_TIER,
  };

  return (
    <TenancyProvider value={tenancy}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AccountShell
          fallbackWorkspace={fallbackWorkspace}
          workspaces={workspaces}
          user={user}
        >
          {children}
        </AccountShell>
      </HydrationBoundary>
    </TenancyProvider>
  );
}
