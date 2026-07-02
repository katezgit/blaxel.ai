"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import {
  DEFAULT_STATUS_FILTERS,
  type StatusFilterLabel,
} from "./aggregate-data";

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

  // Single source of truth for every filter the toolbar dispatches into.
  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] =
    useState<ReadonlyArray<StatusFilterLabel>>(DEFAULT_STATUS_FILTERS);
  const [regionFilter, setRegionFilter] = useState<SandboxRegion | "all">("all");

  const isLoading = stateSim === "loading" || query.isPending;
  const isError = stateSim === "error" || query.isError;
  const sandboxes = useMemo<ReadonlyArray<Sandbox>>(
    () => (stateSim === "empty" ? [] : (query.data ?? [])),
    [stateSim, query.data],
  );

  const showsTable = !isLoading && !isError && sandboxes.length > 0;

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
        defaultStatusFilters={DEFAULT_STATUS_FILTERS}
      />
    );
  }

  // Workspace total reads as inline context next to the title — Alex decides
  // on row-level signal, not fleet counts, so it's a quiet sibling of the h1.
  const totalSandboxes = sandboxes.length;

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="flex items-start justify-between gap-4">
          <h1 className="typography-display font-semibold text-foreground">
            Sandboxes
            {showsTable && totalSandboxes > 0 ? (
              <span className="ml-2 tabular-nums font-normal text-muted-foreground">
                · {totalSandboxes.toLocaleString("en-US")}
              </span>
            ) : null}
          </h1>
          <Button asChild variant="primary">
            <Link href={createHref}>
              <Plus aria-hidden="true" />
              Create Sandbox
            </Link>
          </Button>
        </div>
      </header>
      {body}
    </div>
  );
}
