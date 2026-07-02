"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  MoreHorizontal,
  RotateCw,
  SearchX,
  Terminal,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Chip } from "@repo/ui/components/chip";
import { EmptyState } from "@repo/ui/components/empty-state";
import { IconButton } from "@repo/ui/components/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { SearchInput } from "@repo/ui/components/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  tableBodyClass,
  tableCellVariants,
  tableClass,
  tableHeaderClass,
  tableHeadVariants,
  tableRowVariants,
} from "@repo/ui/components/table";
import type { Sandbox, SandboxRegion } from "@/lib/mock/sandboxes";
import { StatePill, pillFor } from "./state-pill";
import type { StatusFilterLabel } from "./aggregate-data";
import { StatusFilterMenu } from "./status-filter-menu";
import {
  activityBarsFor,
  allocatedRamLabel,
  createdAtLabel,
  expiresInBadgeLabel,
  isExpiresInWarning,
  peakRamCell,
  regionLabel,
} from "./row-helpers";
import { ActivitySparkline } from "./activity-sparkline";
import {
  PAGE_SIZE_OPTIONS,
  SandboxesPagination,
  type PageSize,
} from "./sandboxes-pagination";
import { SandboxesBulkActionBar } from "./sandboxes-bulk-action-bar";

const REGION_OPTIONS: ReadonlyArray<{ value: SandboxRegion | "all"; label: string }> = [
  { value: "all", label: "All regions" },
  { value: "auto", label: "auto" },
  { value: "eu-fra-1", label: "eu-fra-1" },
  { value: "eu-lon-1", label: "eu-lon-1" },
  { value: "us-was-1", label: "us-was-1" },
  { value: "us-pdx-1", label: "us-pdx-1" },
];

const DEFAULT_PAGE_SIZE: PageSize = PAGE_SIZE_OPTIONS[0];

export interface SandboxesListProps {
  sandboxes: ReadonlyArray<Sandbox>;
  workspaceSlug: string;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilters: ReadonlyArray<StatusFilterLabel>;
  onStatusFiltersChange: (value: ReadonlyArray<StatusFilterLabel>) => void;
  regionFilter: SandboxRegion | "all";
  onRegionFilterChange: (value: SandboxRegion | "all") => void;
  /** Terminated is a separate right-anchor toolbar toggle per wireframe §1.2.
   *  When true, Terminated rows are added to the result set on top of the
   *  Status dropdown selection. */
  includeTerminated: boolean;
  onIncludeTerminatedChange: (value: boolean) => void;
  defaultStatusFilters: ReadonlyArray<StatusFilterLabel>;
}

const columnHelper = createColumnHelper<Sandbox>();

export function SandboxesList({
  sandboxes,
  workspaceSlug,
  search,
  onSearchChange,
  statusFilters,
  onStatusFiltersChange,
  regionFilter,
  onRegionFilterChange,
  includeTerminated,
  onIncludeTerminatedChange,
  defaultStatusFilters,
}: SandboxesListProps) {
  const router = useRouter();

  // Filter set: Status dropdown checks + Terminated toggle. Terminated is a
  // separate axis so the dropdown stays four items; Alex only wants it when
  // triaging deletes.
  const visible = useMemo<ReadonlyArray<Sandbox>>(() => {
    const normalized = search.trim().toLowerCase();
    const statusSet = new Set<StatusFilterLabel>(statusFilters);
    if (includeTerminated) statusSet.add("Terminated");
    return sandboxes.filter((sbx) => {
      const pillLabel = pillFor(sbx).label;
      if (!statusSet.has(pillLabel)) return false;
      if (regionFilter !== "all" && sbx.spec.region !== regionFilter) {
        return false;
      }
      if (normalized) {
        const haystack =
          `${sbx.metadata.displayName} ${sbx.metadata.name} ${sbx.metadata.externalId}`.toLowerCase();
        if (!haystack.includes(normalized)) return false;
      }
      return true;
    });
  }, [sandboxes, search, statusFilters, regionFilter, includeTerminated]);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns = useMemo(() => {
    return [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            size="sm"
            aria-label="Select all Sandboxes on this page"
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(value === true)
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            size="sm"
            aria-label={`Select ${row.original.metadata.displayName}`}
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(value === true)}
            onClick={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
        meta: {
          headerClassName: "w-8",
          cellClassName: "w-8",
        },
      }),
      columnHelper.display({
        id: "identity",
        header: "Name / ID",
        cell: (info) => {
          const sbx = info.row.original;
          const showExpiryBadge = isExpiresInWarning(sbx.spec.expiresInSec);
          return (
            <div className="flex flex-col leading-tight">
              <span className="typography-body font-medium text-foreground underline-offset-4 decoration-meta-foreground group-hover/sbx-row:underline">
                {sbx.metadata.displayName}
                {showExpiryBadge && sbx.spec.expiresInSec !== null ? (
                  <span className="ml-2 inline-flex items-center gap-0.5 typography-meta font-medium text-state-warning-text">
                    <TriangleAlert
                      aria-hidden="true"
                      className="size-3"
                    />
                    {expiresInBadgeLabel(sbx.spec.expiresInSec)}
                  </span>
                ) : null}
              </span>
              <span className="typography-meta font-mono text-meta-foreground">
                {sbx.metadata.name}
              </span>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "state",
        header: "Status",
        cell: (info) => <StatePill sandbox={info.row.original} />,
        enableSorting: false,
        meta: { headerClassName: "w-[120px]" },
      }),
      columnHelper.accessor((row) => row.spec.region, {
        id: "region",
        header: "Region",
        cell: (info) => (
          <span className="typography-meta text-meta-foreground">
            {regionLabel(info.getValue())}
          </span>
        ),
        meta: { headerClassName: "w-[104px]" },
      }),
      columnHelper.accessor((row) => row.spec.memoryMib, {
        id: "allocRam",
        header: "Alloc. RAM",
        cell: (info) => (
          <span className="typography-meta font-mono tabular-nums text-meta-foreground">
            {allocatedRamLabel(info.getValue())}
          </span>
        ),
        meta: { headerClassName: "w-[112px]" },
      }),
      columnHelper.accessor(
        (row) => {
          const cell = peakRamCell(row);
          return cell?.percent ?? null;
        },
        {
          id: "peakRam",
          header: "Peak RAM (24h)",
          cell: (info) => {
            const cell = peakRamCell(info.row.original);
            if (!cell) {
              return (
                <span className="typography-meta font-mono text-meta-foreground">
                  —
                </span>
              );
            }
            return (
              <span
                className={cn(
                  "typography-meta font-mono tabular-nums",
                  cell.percent >= 80
                    ? "text-state-warning-text"
                    : "text-meta-foreground",
                )}
              >
                {cell.label}
              </span>
            );
          },
          sortUndefined: "last",
          meta: { headerClassName: "w-[160px]" },
        },
      ),
      columnHelper.accessor((row) => row.metadata.createdAt, {
        id: "createdAt",
        header: "Created at",
        cell: (info) => (
          <span className="typography-meta tabular-nums text-meta-foreground">
            {createdAtLabel(info.getValue())}
          </span>
        ),
        meta: { headerClassName: "w-[160px]" },
      }),
      columnHelper.display({
        id: "activity",
        header: "Activity",
        cell: (info) => {
          const bars = activityBarsFor(info.row.original.vitals.ramStrip);
          if (!bars) {
            return (
              <span
                aria-label="No activity data"
                className="typography-meta text-meta-foreground"
              >
                —
              </span>
            );
          }
          const avg = bars.reduce((sum, v) => sum + v, 0) / bars.length;
          const trend = avg > 0.55 ? "high" : avg > 0.25 ? "moderate" : "low";
          return (
            <ActivitySparkline
              bars={bars}
              ariaLabel={`Activity trend (last 24h): ${trend}`}
            />
          );
        },
        enableSorting: false,
        meta: { headerClassName: "w-[88px]" },
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => <RowActions sandbox={info.row.original} />,
        enableSorting: false,
        meta: {
          headerClassName: "w-10",
          cellClassName: "w-10 text-right",
        },
      }),
    ];
  }, []);

  const table = useReactTable({
    data: visible as Sandbox[],
    columns,
    state: { sorting, pagination, rowSelection },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.metadata.name,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  function clearFilters() {
    onSearchChange("");
    onStatusFiltersChange(defaultStatusFilters);
    onRegionFilterChange("all");
    onIncludeTerminatedChange(false);
  }

  const rows = table.getRowModel().rows;
  const showNoResults = rows.length === 0;
  const selectedRowIds = Object.keys(rowSelection).filter(
    (id) => rowSelection[id],
  );
  const selectedCount = selectedRowIds.length;

  return (
    <div className="flex min-h-0 max-h-full flex-1 flex-col gap-4">
      <div className="flex w-full flex-wrap items-center gap-3 shrink-0">
        <Toolbar
          search={search}
          onSearchChange={onSearchChange}
          statusFilters={statusFilters}
          onStatusFiltersChange={onStatusFiltersChange}
          regionFilter={regionFilter}
          onRegionFilterChange={onRegionFilterChange}
          includeTerminated={includeTerminated}
          onIncludeTerminatedChange={onIncludeTerminatedChange}
        />
      </div>

      {selectedCount > 0 ? (
        <SandboxesBulkActionBar
          selectedCount={selectedCount}
          onClearSelection={() => setRowSelection({})}
          onDelete={() => setRowSelection({})}
        />
      ) : null}

      <div className="relative w-full min-h-0 flex-1 overflow-auto rounded-md border border-border bg-card">
        <table className={tableClass}>
          <thead className={tableHeaderClass}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as
                    | { headerClassName?: string }
                    | undefined;
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  const ariaSort =
                    sortDir === "asc"
                      ? "ascending"
                      : sortDir === "desc"
                        ? "descending"
                        : canSort
                          ? "none"
                          : undefined;
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={ariaSort}
                      className={cn(
                        tableHeadVariants(),
                        "bg-muted-surface",
                        meta?.headerClassName,
                      )}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 text-left hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {sortDir === "asc" ? (
                            <ArrowUp aria-hidden="true" className="size-3" />
                          ) : sortDir === "desc" ? (
                            <ArrowDown aria-hidden="true" className="size-3" />
                          ) : null}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className={tableBodyClass}>
            {showNoResults ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <EmptyState
                    variant="no-results"
                    icon={SearchX}
                    title="No Sandboxes match these filters"
                    subtitle="Adjust your search or filters."
                    cta={
                      <Button variant="ghost" onClick={clearFilters}>
                        Clear filters
                      </Button>
                    }
                  />
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const sbx = row.original;
                const pill = pillFor(sbx);
                const isErrored = pill.label === "Errored";
                const href = `/${workspaceSlug}/sandboxes/${sbx.metadata.name}`;
                return (
                  <SandboxRow
                    key={row.id}
                    sandbox={sbx}
                    isErrored={isErrored}
                    isSelected={row.getIsSelected()}
                    onClick={() => router.push(href)}
                    onMouseEnter={() => router.prefetch(href)}
                    cells={row.getVisibleCells().map((cell) => ({
                      key: cell.id,
                      className: (
                        cell.column.columnDef.meta as
                          | { cellClassName?: string }
                          | undefined
                      )?.cellClassName,
                      node: flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      ),
                    }))}
                    columnsCount={columns.length}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="shrink-0">
        <SandboxesPagination
          pageIndex={table.getState().pagination.pageIndex}
          pageSize={table.getState().pagination.pageSize as PageSize}
          totalRows={rows.length > 0 ? visible.length : 0}
          onPageIndexChange={table.setPageIndex}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      </div>
    </div>
  );
}

interface ToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilters: ReadonlyArray<StatusFilterLabel>;
  onStatusFiltersChange: (value: ReadonlyArray<StatusFilterLabel>) => void;
  regionFilter: SandboxRegion | "all";
  onRegionFilterChange: (value: SandboxRegion | "all") => void;
  includeTerminated: boolean;
  onIncludeTerminatedChange: (value: boolean) => void;
}

function Toolbar({
  search,
  onSearchChange,
  statusFilters,
  onStatusFiltersChange,
  regionFilter,
  onRegionFilterChange,
  includeTerminated,
  onIncludeTerminatedChange,
}: ToolbarProps) {
  return (
    <div className="flex w-full flex-wrap items-center gap-3">
      <div className="w-full sm:w-auto sm:max-w-xs sm:flex-1">
        <SearchInput
          defaultValue={search}
          onLiveChange={onSearchChange}
          placeholder="Search name or ID…"
          aria-label="Search Sandboxes"
        />
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <StatusFilterMenu
          value={statusFilters}
          onChange={onStatusFiltersChange}
        />
        <Select
          value={regionFilter}
          onValueChange={(value) =>
            onRegionFilterChange(value as SandboxRegion | "all")
          }
        >
          <SelectTrigger className="w-40" aria-label="Filter by region">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REGION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                Region: {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Chip
          checked={includeTerminated}
          onCheckedChange={onIncludeTerminatedChange}
          color="neutral"
          variant="light"
          aria-label="Include Terminated Sandboxes"
        >
          Terminated
        </Chip>
      </div>
    </div>
  );
}

interface SandboxRowProps {
  sandbox: Sandbox;
  isErrored: boolean;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  cells: ReadonlyArray<{
    key: string;
    className: string | undefined;
    node: React.ReactNode;
  }>;
  columnsCount: number;
}

function SandboxRow({
  sandbox,
  isErrored,
  isSelected,
  onClick,
  onMouseEnter,
  cells,
  columnsCount,
}: SandboxRowProps) {
  function handleClick(event: React.MouseEvent<HTMLTableRowElement>) {
    const target = event.target as HTMLElement;
    if (
      target.closest(
        "a, button, [role='menuitem'], [role='menu'], [data-slot=checkbox]",
      )
    )
      return;
    onClick();
  }
  return (
    <>
      <tr
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        data-state={isSelected ? "selected" : undefined}
        aria-selected={isSelected || undefined}
        className={cn(
          tableRowVariants(),
          "group/sbx-row cursor-pointer",
          isErrored && sandbox.failure && "border-b-0",
        )}
      >
        {cells.map((cell) => (
          <td key={cell.key} className={cn(tableCellVariants(), cell.className)}>
            {cell.node}
          </td>
        ))}
      </tr>
      {isErrored && sandbox.failure ? (
        <tr className="border-b border-border bg-state-errored-subtle">
          <td colSpan={columnsCount} className="pl-6 pr-6 py-2">
            <div className="flex flex-wrap items-center gap-3 typography-meta text-state-errored-text">
              <span className="inline-flex items-center gap-1.5">
                <TriangleAlert
                  aria-hidden="true"
                  className="size-3.5 shrink-0"
                />
                {sandbox.failure.cause} — push Image or pick another.
              </span>
              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 rounded-sm px-2 py-1 typography-meta font-medium text-state-errored-text hover:bg-state-errored-subtle focus-visible:outline-none focus-visible:shadow-focus-ring"
                >
                  <RotateCw aria-hidden="true" className="size-3" />
                  Retry
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard?.writeText(
                      `bl connect sandbox ${sandbox.metadata.name}`,
                    );
                  }}
                  className="inline-flex items-center gap-1 rounded-sm px-2 py-1 typography-meta font-medium text-state-errored-text hover:bg-state-errored-subtle focus-visible:outline-none focus-visible:shadow-focus-ring"
                >
                  <Terminal aria-hidden="true" className="size-3" />
                  Open in CLI
                </button>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function RowActions({ sandbox }: { sandbox: Sandbox }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label={`Actions for ${sandbox.metadata.displayName}`}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal aria-hidden="true" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onSelect={() => undefined}>Restart</DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() =>
            navigator.clipboard?.writeText(
              `bl connect sandbox ${sandbox.metadata.name}`,
            )
          }
        >
          Open in CLI
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={() => undefined}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
