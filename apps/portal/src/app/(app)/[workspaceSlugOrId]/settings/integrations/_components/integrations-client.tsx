"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { EmptyState } from "@repo/ui/components/empty-state";
import { Input } from "@repo/ui/components/input";
import { SegmentedControl } from "@repo/ui/components/segmented-control";
import type { Integration } from "@/lib/mock/types";
import { workspaceIntegrationQueries } from "@/lib/query/workspace-integrations";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import IntegrationsTable from "./integrations-table";

// Flat one-click filter: a single category state covers status + type in one
// row, matching Blaxel's production vocabulary (status label is "Enabled", and
// the four buckets sit side-by-side as a single selector). "Enabled" derives
// from connection count > 0; no separate stored flag.
type CategoryFilter = "all" | "enabled" | "model" | "mcp-server";

interface CategoryItem {
  value: CategoryFilter;
  label: string;
}

const CATEGORY_FILTERS: ReadonlyArray<CategoryItem> = [
  { value: "all", label: "All" },
  { value: "enabled", label: "Enabled" },
  { value: "model", label: "Model" },
  { value: "mcp-server", label: "MCP server" },
];

interface IntegrationRow {
  integration: Integration;
  connectionCount: number;
}

const columnHelper = createColumnHelper<IntegrationRow>();

export default function IntegrationsClient() {
  const { accountId, workspaceId } = useCurrentTenancy();
  const params = useParams<{ workspaceSlugOrId: string }>();
  const workspaceSlug = params.workspaceSlugOrId;
  const { data: integrations } = useSuspenseQuery(
    workspaceIntegrationQueries.list(accountId, workspaceId),
  );
  const { data: connections } = useSuspenseQuery(
    workspaceIntegrationQueries.connections(accountId, workspaceId),
  );

  const [category, setCategory] = useState<CategoryFilter>("all");
  const [search, setSearch] = useState("");

  const rows = useMemo<ReadonlyArray<IntegrationRow>>(() => {
    const counts = new Map<string, number>();
    for (const c of connections) {
      counts.set(c.providerId, (counts.get(c.providerId) ?? 0) + 1);
    }
    return integrations.map((integration) => ({
      integration,
      connectionCount: counts.get(integration.id) ?? 0,
    }));
  }, [integrations, connections]);

  const categoryCounts = useMemo(() => {
    return {
      all: rows.length,
      enabled: rows.filter((r) => r.connectionCount > 0).length,
      model: rows.filter((r) => r.integration.category === "model").length,
      "mcp-server": rows.filter((r) => r.integration.category === "mcp-server")
        .length,
    } satisfies Record<CategoryFilter, number>;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(({ integration, connectionCount }) => {
      if (category === "enabled" && connectionCount === 0) return false;
      if (category === "model" && integration.category !== "model") return false;
      if (category === "mcp-server" && integration.category !== "mcp-server")
        return false;
      if (
        q &&
        !integration.name.toLowerCase().includes(q) &&
        !integration.description.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [rows, category, search]);

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.integration.name, {
        id: "name",
        header: () => <span>Name</span>,
        cell: ({ row }) => (
          <NameCell
            integration={row.original.integration}
            connectionCount={row.original.connectionCount}
          />
        ),
      }),
      columnHelper.accessor((row) => row.integration.description, {
        id: "description",
        header: () => <span>Description</span>,
        meta: {
          cellClassName:
            "text-caption text-muted-foreground max-w-[28rem] whitespace-normal",
        },
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor((row) => row.connectionCount, {
        id: "connections",
        header: () => <span>Connections</span>,
        meta: { cellClassName: "font-mono tabular-nums" },
        cell: ({ row }) => {
          const count = row.original.connectionCount;
          if (count === 0) return <span className="text-meta-foreground">—</span>;
          return (
            <span className="text-foreground">
              {count} {count === 1 ? "connection" : "connections"}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "action",
        header: () => <span className="sr-only">Action</span>,
        meta: { headerClassName: "w-32", cellClassName: "w-32 text-right" },
        cell: ({ row }) => (
          <RowAction
            integration={row.original.integration}
            connectionCount={row.original.connectionCount}
            workspaceSlug={workspaceSlug}
          />
        ),
      }),
    ],
    [workspaceSlug],
  );

  const table = useReactTable({
    data: filtered as IntegrationRow[],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.integration.id,
  });

  const onClearFilters = () => {
    setSearch("");
    setCategory("all");
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search integrations"
          leading={<Search aria-hidden="true" className="size-3.5" />}
          className="max-w-xs"
          aria-label="Search integrations"
        />
        <SegmentedControl
          value={category}
          onValueChange={(v) => setCategory(v as CategoryFilter)}
          aria-label="Filter integrations by category"
          className="ml-auto"
        >
          {CATEGORY_FILTERS.map((item) => (
            <SegmentedControl.Item key={item.value} value={item.value}>
              <span>{item.label}</span>
              <span className="font-mono text-meta tabular-nums opacity-70">
                {categoryCounts[item.value]}
              </span>
            </SegmentedControl.Item>
          ))}
        </SegmentedControl>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          variant="no-results"
          title="No integrations match"
          subtitle="Try a different search or clear the filters."
          cta={
            <Button variant="secondary" onClick={onClearFilters}>
              Clear search
            </Button>
          }
        />
      ) : (
        <>
          {/* Table at md+; card list below md. Two structurally different
              renderings of the same filtered data, switched by responsive
              visibility — keeps each layout's markup honest instead of
              jamming a layout prop through one component. */}
          <div className="hidden min-h-0 flex-1 md:flex md:flex-col">
            <IntegrationsTable table={table} />
          </div>
          <ul
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto md:hidden"
            role="list"
          >
            {filtered.map((row) => (
              <li key={row.integration.id}>
                <IntegrationCard
                  integration={row.integration}
                  connectionCount={row.connectionCount}
                  workspaceSlug={workspaceSlug}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

interface NameCellProps {
  integration: Integration;
  connectionCount: number;
}

function NameCell({ integration, connectionCount }: NameCellProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar size="sm" shape="square">
        {integration.logoUrl && (
          <AvatarImage src={integration.logoUrl} alt={integration.name} />
        )}
        <AvatarFallback>{integration.logoInitial}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-center gap-2">
          <span className="truncate text-body text-foreground">
            {integration.name}
          </span>
          {connectionCount > 0 && (
            <Badge variant="success" size="sm" showDot>
              Enabled
            </Badge>
          )}
          {integration.comingSoon && (
            <span className="rounded-sm bg-secondary-surface px-1.5 py-0.5 text-meta font-mono text-meta-foreground">
              Coming soon
            </span>
          )}
        </span>
        <span className="text-meta text-meta-foreground">
          {integration.category === "model" ? "Model" : "MCP server"}
        </span>
      </div>
    </div>
  );
}

interface RowActionProps {
  integration: Integration;
  connectionCount: number;
  workspaceSlug: string;
}

function RowAction({
  integration,
  connectionCount,
  workspaceSlug,
}: RowActionProps) {
  if (integration.comingSoon) {
    return (
      <Button
        variant="secondary"
        disabled
        aria-label={`${integration.name} — coming soon`}
      >
        Connect
      </Button>
    );
  }
  const base = `/${workspaceSlug}/settings/integrations/${integration.id}`;
  if (connectionCount > 0) {
    return (
      <Button variant="ghost" asChild>
        <Link href={base}>Manage</Link>
      </Button>
    );
  }
  return (
    <Button variant="secondary" asChild>
      <Link href={`${base}?action=create`}>Connect</Link>
    </Button>
  );
}

interface IntegrationCardProps {
  integration: Integration;
  connectionCount: number;
  workspaceSlug: string;
}

function IntegrationCard({
  integration,
  connectionCount,
  workspaceSlug,
}: IntegrationCardProps) {
  const label =
    connectionCount === 0
      ? "—"
      : `${connectionCount} ${connectionCount === 1 ? "connection" : "connections"}`;

  return (
    <Card variant="elevated" className="flex flex-col gap-3 p-4">
      <NameCell integration={integration} connectionCount={connectionCount} />
      <p className="text-caption text-muted-foreground">
        {integration.description}
      </p>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-caption text-meta-foreground tabular-nums">
          {label}
        </span>
        <RowAction
          integration={integration}
          connectionCount={connectionCount}
          workspaceSlug={workspaceSlug}
        />
      </div>
    </Card>
  );
}
