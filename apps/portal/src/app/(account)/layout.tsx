import type { ReactNode } from "react";
import { Suspense } from "react";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import AccountShell from "@/components/shell/account-shell";
import { AccountShellSkeleton } from "@/components/shell/account-shell-skeleton";
import { requireSession } from "@/lib/auth/session";
import { getQueryClient } from "@/lib/query/get-query-client";
import { orgQueries } from "@/lib/query/org";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { TenancyProvider } from "@/lib/query/tenancy-context";

// Sync layout — async work is delegated to AccountShellHost behind a
// Suspense boundary so cross-shell entries paint the destination shell
// skeleton immediately. The (account)/loading.tsx file-level fallback
// can't catch the layout's own await (Next 16: loading.tsx wraps children
// of a segment, not the segment's own layout), so the Suspense lives
// inside the layout itself. Sub-shell discrimination (Profile vs Account
// nav) stays URL-derived inside both the skeleton and the real shell.
const FALLBACK_USER_TIER = "Tier 0";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AccountShellSkeleton />}>
      <AccountShellHost>{children}</AccountShellHost>
    </Suspense>
  );
}

async function AccountShellHost({ children }: { children: ReactNode }) {
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
