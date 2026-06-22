"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { EmptyState } from "@repo/ui/components/empty-state";
import { Input } from "@repo/ui/components/input";
import { SegmentedControl } from "@repo/ui/components/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { cn } from "@repo/ui/lib/cn";
import type { Integration } from "@/lib/mock/types";
import { workspaceIntegrationQueries } from "@/lib/query/workspace-integrations";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import ConnectionDrawer from "../[provider]/_components/connection-drawer";
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
  { value: "enabled", label: "Connected providers" },
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
  const router = useRouter();
  const { data: integrations } = useSuspenseQuery(
    workspaceIntegrationQueries.list(accountId, workspaceId),
  );
  const { data: connections } = useSuspenseQuery(
    workspaceIntegrationQueries.connections(accountId, workspaceId),
  );

  const [category, setCategory] = useState<CategoryFilter>("all");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  // First-connection path: catalog opens the create drawer inline so the user
  // doesn't bounce through an empty detail page just to click another CTA.
  // `connectFor === null` = closed; otherwise the row whose Connect button was
  // clicked. On successful create we route to that provider's detail page so
  // the user lands where the freshly-created connection lives.
  const [connectFor, setConnectFor] = useState<Integration | null>(null);

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
        header: ({ column }) => <SortHeader column={column} label="Name" />,
        sortingFn: (a, b) =>
          a.original.integration.name.localeCompare(b.original.integration.name),
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
        enableSorting: false,
        meta: {
          cellClassName:
            "text-caption text-muted-foreground max-w-[28rem] whitespace-normal",
        },
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor((row) => row.connectionCount, {
        id: "connections",
        header: () => <span>Connections</span>,
        enableSorting: false,
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
        enableSorting: false,
        meta: { headerClassName: "w-32", cellClassName: "w-32 text-right" },
        cell: ({ row }) => (
          <RowAction
            integration={row.original.integration}
            connectionCount={row.original.connectionCount}
            workspaceSlug={workspaceSlug}
            onConnect={setConnectFor}
          />
        ),
      }),
    ],
    [workspaceSlug],
  );

  const table = useReactTable({
    data: filtered as IntegrationRow[],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.integration.id,
  });

  const onClearFilters = () => {
    setSearch("");
    setCategory("all");
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 items-center gap-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search integrations"
          leading={<Search aria-hidden="true" className="size-3.5" />}
          className="min-w-0 flex-1 md:max-w-xs"
          aria-label="Search integrations"
        />
        <SegmentedControl
          value={category}
          onValueChange={(v) => setCategory(v as CategoryFilter)}
          aria-label="Filter integrations by category"
          className="ml-auto hidden md:inline-flex"
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
        <Select
          value={category}
          onValueChange={(v) => setCategory(v as CategoryFilter)}
        >
          <SelectTrigger
            aria-label="Filter integrations by category"
            className="shrink-0 md:hidden"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_FILTERS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                <span>{item.label}</span>
                <span className="ml-2 font-mono text-meta tabular-nums opacity-70">
                  {categoryCounts[item.value]}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden px-px md:hidden"
            role="list"
          >
            {filtered.map((row) => (
              <li key={row.integration.id}>
                <IntegrationCard
                  integration={row.integration}
                  connectionCount={row.connectionCount}
                  workspaceSlug={workspaceSlug}
                  onConnect={setConnectFor}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      {connectFor && (
        <ConnectionDrawer
          provider={connectFor}
          state={{ mode: "create" }}
          onClose={(reason) => {
            const providerId = connectFor.id;
            setConnectFor(null);
            if (reason === "created") {
              router.push(
                `/${workspaceSlug}/settings/integrations/${providerId}`,
              );
            }
          }}
        />
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
              Connected
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
  onConnect: (integration: Integration) => void;
}

function RowAction({
  integration,
  connectionCount,
  workspaceSlug,
  onConnect,
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
  if (connectionCount > 0) {
    const base = `/${workspaceSlug}/settings/integrations/${integration.id}`;
    return (
      <Button variant="ghost" asChild>
        <Link href={base}>Manage</Link>
      </Button>
    );
  }
  return (
    <Button variant="secondary" onClick={() => onConnect(integration)}>
      Connect
    </Button>
  );
}

interface IntegrationCardProps {
  integration: Integration;
  connectionCount: number;
  workspaceSlug: string;
  onConnect: (integration: Integration) => void;
}

interface SortHeaderProps {
  // `Column` from TanStack carries the row type; cast at the call site since
  // this header is reused across columns that all share the same row shape.
  column: {
    getIsSorted: () => false | "asc" | "desc";
    toggleSorting: (desc?: boolean) => void;
  };
  label: string;
}

const SORT_ICON = {
  asc: ArrowUp,
  desc: ArrowDown,
  none: ArrowUpDown,
} as const;

function SortHeader({ column, label }: SortHeaderProps) {
  const sorted = column.getIsSorted();
  const Icon = SORT_ICON[sorted === false ? "none" : sorted];
  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(sorted === "asc")}
      className={cn(
        "group inline-flex items-center gap-1.5 text-left text-label font-medium",
        "outline-hidden focus-visible:shadow-focus-ring rounded-sm",
        sorted ? "text-foreground" : "text-meta-foreground hover:text-foreground",
      )}
      aria-label={
        sorted === "asc"
          ? `Sorted by ${label} ascending. Click to sort descending.`
          : sorted === "desc"
            ? `Sorted by ${label} descending. Click to clear sort.`
            : `Sort by ${label}.`
      }
    >
      <span>{label}</span>
      <Icon
        aria-hidden="true"
        className={cn(
          "size-3 shrink-0 transition-opacity",
          sorted ? "opacity-100" : "opacity-0 group-hover:opacity-60",
        )}
      />
    </button>
  );
}

function IntegrationCard({
  integration,
  connectionCount,
  workspaceSlug,
  onConnect,
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
          onConnect={onConnect}
        />
      </div>
    </Card>
  );
}
