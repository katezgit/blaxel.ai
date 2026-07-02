"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  MoreHorizontal,
  RotateCw,
  ScrollText,
  SearchX,
  Terminal,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@repo/ui/lib/cn";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";
import { Button } from "@repo/ui/components/button";
import { Chip } from "@repo/ui/components/chip";
import { EmptyState } from "@repo/ui/components/empty-state";
import { IconButton } from "@repo/ui/components/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { formatRegion } from "@/lib/regions";
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
} from "./row-helpers";
import { ActivitySparkline } from "./activity-sparkline";
import {
  PAGE_SIZE_OPTIONS,
  SandboxesPagination,
  type PageSize,
} from "./sandboxes-pagination";

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

// Fade-out duration for the row exit animation before it's removed from the
// data set. Kept short — Alex is scanning; a slow disappear reads sluggish.
const ROW_FADE_MS = 180;

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

  // Mock-only client-side mutations. TanStack query cache stays untouched;
  // these two overlays fold on top of the fetched list so Restart + Delete
  // feel responsive without a backend. `fadingOut` runs the exit animation
  // before the row moves into `deleted` and disappears.
  const [restartedNames, setRestartedNames] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [fadingOutNames, setFadingOutNames] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [deletedNames, setDeletedNames] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [pendingDelete, setPendingDelete] = useState<Sandbox | null>(null);

  const handleRestart = useCallback((sbx: Sandbox) => {
    setRestartedNames((prev) => {
      const next = new Set(prev);
      next.add(sbx.metadata.name);
      return next;
    });
    toast.success(`Restarting ${sbx.metadata.name}`);
  }, []);

  const handleConfirmDelete = useCallback((sbx: Sandbox) => {
    const name = sbx.metadata.name;
    setFadingOutNames((prev) => {
      const next = new Set(prev);
      next.add(name);
      return next;
    });
    setPendingDelete(null);
    window.setTimeout(() => {
      setDeletedNames((prev) => {
        const next = new Set(prev);
        next.add(name);
        return next;
      });
      setFadingOutNames((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
    }, ROW_FADE_MS);
    toast.success(`${name} deleted`);
  }, []);

  const projected = useMemo<ReadonlyArray<Sandbox>>(() => {
    if (restartedNames.size === 0 && deletedNames.size === 0) return sandboxes;
    const out: Sandbox[] = [];
    for (const sbx of sandboxes) {
      if (deletedNames.has(sbx.metadata.name)) continue;
      out.push(
        restartedNames.has(sbx.metadata.name)
          ? { ...sbx, status: "DEPLOYING" }
          : sbx,
      );
    }
    return out;
  }, [sandboxes, restartedNames, deletedNames]);

  // Pre-Status subset: Search + Region + Terminated toggle applied, Status
  // checkboxes NOT applied. Status counts derive from this set so the
  // population breakdown Alex sees in the dropdown stays stable as she
  // toggles Status checkboxes but shifts when she narrows Region or search.
  const preStatusSet = useMemo<ReadonlyArray<Sandbox>>(() => {
    const normalized = search.trim().toLowerCase();
    return projected.filter((sbx) => {
      const pillLabel = pillFor(sbx).label;
      // Terminated toggle gates Terminated rows independent of Status checks.
      if (pillLabel === "Terminated" && !includeTerminated) return false;
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
  }, [projected, search, regionFilter, includeTerminated]);

  const statusCounts = useMemo<Readonly<Record<StatusFilterLabel, number>>>(() => {
    const acc: Record<StatusFilterLabel, number> = {
      Active: 0,
      Standby: 0,
      Failed: 0,
      Deploying: 0,
      Terminated: 0,
    };
    for (const sbx of preStatusSet) {
      const pillLabel = pillFor(sbx).label;
      acc[pillLabel] += 1;
    }
    return acc;
  }, [preStatusSet]);

  const visible = useMemo<ReadonlyArray<Sandbox>>(() => {
    const statusSet = new Set<StatusFilterLabel>(statusFilters);
    if (includeTerminated) statusSet.add("Terminated");
    return preStatusSet.filter((sbx) => statusSet.has(pillFor(sbx).label));
  }, [preStatusSet, statusFilters, includeTerminated]);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const columns = useMemo(() => {
    return [
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
        cell: (info) => {
          const region = formatRegion(info.getValue());
          return (
            <span className="inline-flex items-center gap-1.5 typography-meta text-meta-foreground whitespace-nowrap">
              {region.flag ? (
                <span aria-hidden="true" className="text-base leading-none">
                  {region.flag}
                </span>
              ) : null}
              <span className="text-foreground">{region.label}</span>
              {region.label !== region.slug && (
                <span className="font-mono text-meta-foreground">
                  ({region.slug})
                </span>
              )}
            </span>
          );
        },
        meta: { headerClassName: "w-[200px]" },
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
        cell: (info) => (
          <RowActions
            sandbox={info.row.original}
            workspaceSlug={workspaceSlug}
            onRestart={handleRestart}
            onRequestDelete={setPendingDelete}
          />
        ),
        enableSorting: false,
        meta: {
          headerClassName: "w-10",
          cellClassName: "w-10 text-right",
        },
      }),
    ];
  }, [workspaceSlug, handleRestart]);

  const table = useReactTable({
    data: visible as Sandbox[],
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
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

  return (
    <div className="flex min-h-0 max-h-full flex-1 flex-col gap-4">
      <div className="flex w-full flex-wrap items-center gap-3 shrink-0">
        <Toolbar
          search={search}
          onSearchChange={onSearchChange}
          statusFilters={statusFilters}
          onStatusFiltersChange={onStatusFiltersChange}
          statusCounts={statusCounts}
          regionFilter={regionFilter}
          onRegionFilterChange={onRegionFilterChange}
          includeTerminated={includeTerminated}
          onIncludeTerminatedChange={onIncludeTerminatedChange}
        />
      </div>

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
                const isFailed = pill.label === "Failed";
                const isFadingOut = fadingOutNames.has(sbx.metadata.name);
                const href = `/${workspaceSlug}/sandboxes/${sbx.metadata.name}`;
                return (
                  <SandboxRow
                    key={row.id}
                    isFailed={isFailed}
                    isFadingOut={isFadingOut}
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

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &quot;{pendingDelete?.metadata.name ?? ""}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The Sandbox and its runtime state will be
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) handleConfirmDelete(pendingDelete);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface ToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilters: ReadonlyArray<StatusFilterLabel>;
  onStatusFiltersChange: (value: ReadonlyArray<StatusFilterLabel>) => void;
  statusCounts: Readonly<Record<StatusFilterLabel, number>>;
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
  statusCounts,
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
          counts={statusCounts}
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
  isFailed: boolean;
  isFadingOut: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  cells: ReadonlyArray<{
    key: string;
    className: string | undefined;
    node: React.ReactNode;
  }>;
}

function SandboxRow({
  isFailed,
  isFadingOut,
  onClick,
  onMouseEnter,
  cells,
}: SandboxRowProps) {
  function handleClick(event: React.MouseEvent<HTMLTableRowElement>) {
    if (isFadingOut) return;
    const target = event.target as HTMLElement;
    if (target.closest("a, button, [role='menuitem'], [role='menu']")) return;
    onClick();
  }
  return (
    <tr
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        tableRowVariants(),
        "group/sbx-row cursor-pointer transition-opacity duration-150",
        isFailed &&
          // eslint-disable-next-line no-restricted-syntax -- inset accent sits inside the bordered table container; no @theme utility expresses inset-shadow position+width for a color token
          "bg-state-errored-subtle shadow-[inset_2px_0_0_var(--color-state-errored)] hover:bg-state-errored-subtle",
        isFadingOut && "pointer-events-none opacity-0",
      )}
    >
      {cells.map((cell) => (
        <td key={cell.key} className={cn(tableCellVariants(), cell.className)}>
          {cell.node}
        </td>
      ))}
    </tr>
  );
}

interface RowActionsProps {
  sandbox: Sandbox;
  workspaceSlug: string;
  onRestart: (sandbox: Sandbox) => void;
  onRequestDelete: (sandbox: Sandbox) => void;
}

function RowActions({
  sandbox,
  workspaceSlug,
  onRestart,
  onRequestDelete,
}: RowActionsProps) {
  const router = useRouter();
  const name = sandbox.metadata.name;
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
        <DropdownMenuItem
          onSelect={() => {
            const cmd = `bl connect sandbox ${name}`;
            void navigator.clipboard?.writeText(cmd);
            toast.success(`Copied — ${cmd}`);
          }}
        >
          <Terminal aria-hidden="true" />
          Open in CLI
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() =>
            router.push(`/${workspaceSlug}/sandboxes/${name}/logs`)
          }
        >
          <ScrollText aria-hidden="true" />
          View logs
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onRestart(sandbox)}>
          <RotateCw aria-hidden="true" />
          Restart
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => onRequestDelete(sandbox)}
        >
          <Trash2 aria-hidden="true" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
