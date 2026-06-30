"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import { Button } from "@repo/ui/components/button";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { sandboxQueries } from "@/lib/query/sandboxes";
import type { Sandbox, SandboxRegion } from "@/lib/mock/sandboxes";
import { SandboxesList } from "./sandboxes-list";
import { SandboxesErrorBand } from "./sandboxes-error-band";
import { SandboxesTableSkeleton } from "./sandboxes-table-skeleton";
import { SandboxesEmptyState } from "./sandboxes-empty-state";
import { SandboxesAggregateStrip } from "./sandboxes-aggregate-strip";
import { SandboxesAggregateStripSkeleton } from "./sandboxes-aggregate-strip-skeleton";
import { computeAggregateData, type StateBreakdownLabel } from "./aggregate-data";

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

  // Single source of truth for every filter the toolbar AND the strip both
  // dispatch into. Lifted to the view so the strip↔toolbar↔table cannot
  // desync (wireframe §1.3 sync table).
  const [search, setSearch] = useState("");
  const [stateFilters, setStateFilters] =
    useState<ReadonlyArray<StateBreakdownLabel>>([]);
  const [regionFilter, setRegionFilter] = useState<SandboxRegion | "all">("all");
  const [imageFilter, setImageFilter] = useState<string | null>(null);
  const [includeTerminated, setIncludeTerminated] = useState(false);

  const isLoading = stateSim === "loading" || query.isPending;
  const isError = stateSim === "error" || query.isError;
  const sandboxes = useMemo<ReadonlyArray<Sandbox>>(
    () => (stateSim === "empty" ? [] : (query.data ?? [])),
    [stateSim, query.data],
  );

  const aggregate = useMemo(
    () => computeAggregateData(sandboxes, { includeTerminated }),
    [sandboxes, includeTerminated],
  );

  // Populated-list mode renders the aggregate strip AND bounds the page-shell
  // to the viewport so chrome (page-header + strip + toolbar + table column
  // header) stays fixed and only the table body scrolls. Other states
  // (loading / error / empty) keep the natural page-shell scroll so their
  // hero-style content fits the page on its own.
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
        stateFilters={stateFilters}
        onStateFiltersChange={setStateFilters}
        regionFilter={regionFilter}
        onRegionFilterChange={setRegionFilter}
        imageFilter={imageFilter}
        onImageFilterChange={setImageFilter}
        includeTerminated={includeTerminated}
        onIncludeTerminatedChange={setIncludeTerminated}
      />
    );
  }

  return (
    <div
      className={cn(
        "page-shell",
        showsTable && "h-full overflow-hidden pb-0",
      )}
    >
      <header className="page-header">
        <div className="flex items-start justify-between gap-4">
          <h1 className="typography-display font-semibold text-foreground">
            Sandboxes
          </h1>
          <Button asChild variant="primary">
            <Link href={createHref}>
              <Plus aria-hidden="true" />
              Create Sandbox
            </Link>
          </Button>
        </div>
      </header>
      {isLoading ? <SandboxesAggregateStripSkeleton /> : null}
      {showsTable ? (
        // Bounded region: strip + toolbar pin to the top, table body owns the
        // only scroll boundary. flex min-h-0 lets the scroll container shrink.
        <div className="flex min-h-0 flex-1 flex-col gap-6">
          <SandboxesAggregateStrip
            data={aggregate}
            stateFilters={stateFilters}
            onStateFiltersChange={setStateFilters}
            regionFilter={regionFilter}
            onRegionFilterChange={setRegionFilter}
            imageFilter={imageFilter}
            onImageFilterChange={setImageFilter}
          />
          {body}
        </div>
      ) : (
        body
      )}
    </div>
  );
}
