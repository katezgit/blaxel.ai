"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
import { CreatePolicyDrawer } from "./create-policy-drawer";

// Dev simulation harness — `?state=loading|error|empty` overrides the live
// fetch state so each wireframe state can be visually verified without
// touching mock fixtures. Sibling to `?tier=N` on the account context.
type StateSim = "loading" | "error" | "empty" | null;
function readStateSim(value: string | null): StateSim {
  if (value === "loading" || value === "error" || value === "empty") return value;
  return null;
}

export function PoliciesView() {
  const { accountId, workspaceId } = useCurrentTenancy();
  const { state } = useAccountState();
  const searchParams = useSearchParams();
  const stateSim = readStateSim(searchParams.get("state"));
  const [createOpen, setCreateOpen] = useState(false);

  // Tier-1 locked surface — independent of fetch state. The list is still
  // prefetched at the route boundary; tier is the gate, not the data.
  if (state.tier === 0) {
    return <PoliciesTierLockedView />;
  }

  return (
    <>
      <PoliciesViewUnlocked
        accountId={accountId}
        workspaceId={workspaceId}
        stateSim={stateSim}
        onCreate={() => setCreateOpen(true)}
      />
      <CreatePolicyDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </>
  );
}

interface PoliciesViewUnlockedProps {
  accountId: string;
  workspaceId: string;
  stateSim: StateSim;
  onCreate: () => void;
}

function PoliciesViewUnlocked({
  accountId,
  workspaceId,
  stateSim,
  onCreate,
}: PoliciesViewUnlockedProps) {
  const query = useQuery({
    ...policyQueries.list(accountId, workspaceId),
    enabled: stateSim !== "loading" && stateSim !== "error",
  });

  let body: React.ReactNode;
  if (stateSim === "loading" || query.isPending) {
    body = <PoliciesTableSkeleton />;
  } else if (stateSim === "error" || query.isError) {
    body = <PoliciesErrorBand onRetry={() => query.refetch()} />;
  } else {
    const policies = (stateSim === "empty" ? [] : query.data ?? []) as ReadonlyArray<Policy>;
    body =
      policies.length === 0 ? (
        <PoliciesEmptyState onCreate={onCreate} />
      ) : (
        <PoliciesTable policies={policies} />
      );
  }

  return (
    <div className="page-shell">
      <PoliciesPageHeader showCreate onCreate={onCreate} />
      {body}
    </div>
  );
}
