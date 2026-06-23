"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@repo/ui/lib/cn";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { useAccountState } from "@/lib/mock/account-context";
import { policyQueries } from "@/lib/query/policies";
import type { Policy } from "@/lib/mock/policies";
import { PoliciesTierLockedView } from "./policies-tier-locked-view";
import { PoliciesPageHeader } from "./policies-page-header";
import { PoliciesTable } from "./policies-table";
import { PoliciesTableSkeleton } from "./policies-table-skeleton";
import { PoliciesErrorBand } from "./policies-error-band";
import { PoliciesEmptyState } from "./policies-empty-state";

// Dev simulation harness — `?state=loading|error|empty` overrides the live
// fetch state so each wireframe state can be visually verified without
// touching mock fixtures. Sibling to `?tier=N` on the account context.
type StateSim = "loading" | "error" | "empty" | null;
function readStateSim(value: string | null): StateSim {
  if (value === "loading" || value === "error" || value === "empty") return value;
  return null;
}

const LIST_DESCRIPTION = (
  <p className="max-w-2xl typography-body text-muted-foreground">
    Control where workloads run, which hardware they use, and token limits for
    governed deployments.
  </p>
);

export function PoliciesView() {
  const { accountId, workspaceId } = useCurrentTenancy();
  const { state } = useAccountState();
  const searchParams = useSearchParams();
  const params = useParams<{ workspaceSlugOrId: string }>();
  const stateSim = readStateSim(searchParams.get("state"));
  const createHref = `/${params.workspaceSlugOrId}/policies/new`;

  // Tier-1 locked surface — independent of fetch state. The list is still
  // prefetched at the route boundary; tier is the gate, not the data.
  if (state.tier === 0) {
    return <PoliciesTierLockedView />;
  }

  return (
    <PoliciesViewUnlocked
      accountId={accountId}
      workspaceId={workspaceId}
      stateSim={stateSim}
      createHref={createHref}
    />
  );
}

interface PoliciesViewUnlockedProps {
  accountId: string;
  workspaceId: string;
  stateSim: StateSim;
  createHref: string;
}

function PoliciesViewUnlocked({
  accountId,
  workspaceId,
  stateSim,
  createHref,
}: PoliciesViewUnlockedProps) {
  const query = useQuery({
    ...policyQueries.list(accountId, workspaceId),
    enabled: stateSim !== "loading" && stateSim !== "error",
  });

  const showsTable =
    stateSim !== "loading" &&
    stateSim !== "error" &&
    stateSim !== "empty" &&
    !query.isPending &&
    !query.isError &&
    (query.data?.length ?? 0) > 0;

  let body: React.ReactNode;
  if (stateSim === "loading" || query.isPending) {
    body = <PoliciesTableSkeleton />;
  } else if (stateSim === "error" || query.isError) {
    body = <PoliciesErrorBand onRetry={() => query.refetch()} />;
  } else {
    const policies = (stateSim === "empty" ? [] : query.data ?? []) as ReadonlyArray<Policy>;
    body =
      policies.length === 0 ? (
        <PoliciesEmptyState createHref={createHref} />
      ) : (
        <PoliciesTable policies={policies} />
      );
  }

  // Populated list bounds the page-shell to the viewport so chrome (H1,
  // description, filter row, table column header) stays fixed and only the
  // table body scrolls. Other states keep the natural page-shell scroll.
  return (
    <div
      className={cn(
        "page-shell",
        showsTable && "h-full overflow-hidden pb-0",
      )}
    >
      <PoliciesPageHeader createHref={createHref} description={LIST_DESCRIPTION} />
      {showsTable ? (
        <div className="flex min-h-0 flex-1 flex-col">{body}</div>
      ) : (
        body
      )}
    </div>
  );
}
