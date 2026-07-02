"use client";

import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { sandboxQueries } from "@/lib/query/sandboxes";
import type { Sandbox, SandboxRegion } from "@/lib/mock/sandboxes";
import { SandboxesList } from "./sandboxes-list";
import { SandboxesErrorBand } from "./sandboxes-error-band";
import { SandboxesTableSkeleton } from "./sandboxes-table-skeleton";
import { SandboxesEmptyState } from "./sandboxes-empty-state";
import { SandboxQuotaChip } from "./sandbox-quota-chip";
import {
  DEFAULT_STATUS_FILTERS,
  type StatusFilterLabel,
} from "./aggregate-data";

// Tier 0 quota per docs/product/platform.md — Free tier caps active
// Sandboxes at 16. Detail-page quota lookup is out of scope; the mock
// resolves to the Tier 0 shape everywhere.
const TIER_0_QUOTA = 16;
const CURRENT_TIER = 0;

// Dev simulation harness — `?state=loading|error|empty` overrides the live
// fetch state so each wireframe state can be visually verified without
// touching mock fixtures. Mirrors the policies-view pattern.
type StateSim = "loading" | "error" | "empty" | null;
function readStateSim(value: string | null): StateSim {
  if (value === "loading" || value === "error" || value === "empty") return value;
  return null;
}

export function SandboxesView() {
  const { accountId, workspaceId } = useCurrentTenancy();
  const params = useParams<{ workspaceSlugOrId: string }>();
  const searchParams = useSearchParams();
  const stateSim = readStateSim(searchParams.get("state"));
  const createHref = `/${params.workspaceSlugOrId}/sandboxes/new`;

  const query = useQuery({
    ...sandboxQueries.list(accountId, workspaceId),
    enabled: stateSim !== "loading" && stateSim !== "error",
  });

  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] =
    useState<ReadonlyArray<StatusFilterLabel>>(DEFAULT_STATUS_FILTERS);
  const [regionFilter, setRegionFilter] = useState<SandboxRegion | "all">("all");
  const [includeTerminated, setIncludeTerminated] = useState(false);

  const isLoading = stateSim === "loading" || query.isPending;
  const isError = stateSim === "error" || query.isError;
  const sandboxes = useMemo<ReadonlyArray<Sandbox>>(
    () => (stateSim === "empty" ? [] : (query.data ?? [])),
    [stateSim, query.data],
  );

  // Quota chip: count active (non-Terminated) Sandboxes and compute remaining
  // against Tier 0. Terminated rows don't count against quota.
  const activeCount = sandboxes.filter(
    (s) => s.status !== "TERMINATED" && s.status !== "DELETING",
  ).length;
  const remainingQuota = Math.max(0, TIER_0_QUOTA - activeCount);

  // Quota chip: visible whenever the workspace has at least one Sandbox (or
  // is loading — chip renders once data arrives). Hidden on the pure zero-
  // records empty state and on top-level fetch error where the chip's ambient
  // context has no counterpart to anchor to.
  const showQuotaChip = !isError && (isLoading || sandboxes.length > 0);

  let body: React.ReactNode;
  if (isLoading) {
    body = <SandboxesTableSkeleton />;
  } else if (isError) {
    body = <SandboxesErrorBand onRetry={() => query.refetch()} />;
  } else if (sandboxes.length === 0) {
    body = <SandboxesEmptyState createHref={createHref} />;
  } else {
    body = (
      <SandboxesList
        sandboxes={sandboxes}
        workspaceSlug={params.workspaceSlugOrId}
        search={search}
        onSearchChange={setSearch}
        statusFilters={statusFilters}
        onStatusFiltersChange={setStatusFilters}
        regionFilter={regionFilter}
        onRegionFilterChange={setRegionFilter}
        includeTerminated={includeTerminated}
        onIncludeTerminatedChange={setIncludeTerminated}
        defaultStatusFilters={DEFAULT_STATUS_FILTERS}
      />
    );
  }

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="typography-display font-semibold text-foreground">
              Sandboxes
            </h1>
            {showQuotaChip ? (
              <SandboxQuotaChip
                remaining={remainingQuota}
                tier={CURRENT_TIER}
                quotaCap={TIER_0_QUOTA}
              />
            ) : null}
          </div>
          <Button variant="primary" disabled>
            <Plus aria-hidden="true" />
            Create Sandbox
          </Button>
        </div>
      </header>
      {body}
    </div>
  );
}
