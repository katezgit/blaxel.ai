import type { ReactNode } from "react";
import { Suspense } from "react";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { UnifiedShell } from "@/components/shell/unified-shell";
import { UnifiedShellSkeleton } from "@/components/shell/unified-shell-skeleton";
import { requireSession } from "@/lib/auth/session";
import { getQueryClient } from "@/lib/query/get-query-client";
import { orgQueries } from "@/lib/query/org";
import { getCurrentTenancy } from "@/lib/query/tenancy";
import { TenancyProvider } from "@/lib/query/tenancy-context";

// Single authenticated shell host. Mounted at the (app) route-group root so
// the shell frame (topbar, chevron, mobile drawer) persists across /{slug} ↔
// /profile, /{slug} ↔ /account, /{slug} ↔ /{slug}/settings/*. Only the inner
// sidebar swaps on sub-shell navigation — a keyed `<Sidebar>` wrapper in
// <UnifiedShell> drives the slide-in keyframe. React does not unmount and
// remount the shell host.
//
// Workspace-specific data (currentOrg) resolves in the deeper
// [workspaceSlugOrId]/layout.tsx and rides into the already-mounted shell via
// ActiveWorkspaceProvider — that layout no longer carries the chrome.

const FALLBACK_USER_TIER = "Tier 1";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<UnifiedShellSkeleton />}>
      <UnifiedShellHost>{children}</UnifiedShellHost>
    </Suspense>
  );
}

async function UnifiedShellHost({ children }: { children: ReactNode }) {
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
    throw new Error("Unified shell requires at least one workspace membership.");
  }

  const user = {
    name: session.name || "User",
    email: session.email,
    tier: FALLBACK_USER_TIER,
  };

  return (
    <TenancyProvider value={tenancy}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <UnifiedShell
          fallbackWorkspace={fallbackWorkspace}
          workspaces={workspaces}
          user={user}
        >
          {children}
        </UnifiedShell>
      </HydrationBoundary>
    </TenancyProvider>
  );
}
