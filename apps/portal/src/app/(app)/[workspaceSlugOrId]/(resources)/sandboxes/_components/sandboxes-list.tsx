"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AlertTriangle, MoreHorizontal, SearchX } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import { Button } from "@repo/ui/components/button";
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
  expiresInLabel,
  imageRefLabel,
  isExpiresInWarning,
  regionLabel,
} from "./row-helpers";

const REGION_OPTIONS: ReadonlyArray<{ value: SandboxRegion | "all"; label: string }> = [
  { value: "all", label: "All regions" },
  { value: "auto", label: "auto" },
  { value: "eu-fra-1", label: "eu-fra-1" },
  { value: "eu-lon-1", label: "eu-lon-1" },
  { value: "us-was-1", label: "us-was-1" },
  { value: "us-pdx-1", label: "us-pdx-1" },
];

export interface SandboxesListProps {
  sandboxes: ReadonlyArray<Sandbox>;
  workspaceSlug: string;
  // Filter state is owned by the parent (sandboxes-view) so the Status
  // dropdown and the table dispatch into the same source of truth.
  search: string;
  onSearchChange: (value: string) => void;
  /** Multi-select status filter — covers all 5 sandbox statuses. */
  statusFilters: ReadonlyArray<StatusFilterLabel>;
  onStatusFiltersChange: (value: ReadonlyArray<StatusFilterLabel>) => void;
  regionFilter: SandboxRegion | "all";
  onRegionFilterChange: (value: SandboxRegion | "all") => void;
  /** Defaults set — used by Clear filters and the no-results CTA to reset. */
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
  defaultStatusFilters,
}: SandboxesListProps) {
  const router = useRouter();

  // Visible rows. Rows with a status NOT in the active status set are hidden;
  // Terminated is hidden by default because it's unchecked in the Status
  // dropdown's defaults.
  const visible = useMemo<ReadonlyArray<Sandbox>>(() => {
    const normalized = search.trim().toLowerCase();
    const statusSet = new Set(statusFilters);
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
  }, [sandboxes, search, statusFilters, regionFilter]);

  const columns = useMemo(() => {
    return [
      columnHelper.display({
        id: "identity",
        header: "Name / ID",
        cell: (info) => {
          const sbx = info.row.original;
          return (
            <div className="flex flex-col leading-tight">
              <span className="typography-body font-medium text-foreground underline-offset-4 decoration-meta-foreground group-hover/sbx-row:underline">
                {sbx.metadata.displayName}
              </span>
              <span className="typography-meta font-mono text-meta-foreground">
                {sbx.metadata.externalId}
              </span>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "state",
        header: "State",
        cell: (info) => <StatePill sandbox={info.row.original} />,
      }),
      columnHelper.accessor((row) => row.spec.region, {
        id: "region",
        header: "Region",
        cell: (info) => (
          <span className="typography-meta text-meta-foreground">
            {regionLabel(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.spec.image, {
        id: "image",
        header: "Image",
        cell: (info) => (
          <span className="typography-meta font-mono text-meta-foreground">
            {imageRefLabel(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.spec.expiresInSec, {
        id: "expiresIn",
        header: "Expires in",
        cell: (info) => {
          const sec = info.getValue();
          return (
            <span
              className={cn(
                "typography-meta font-mono tabular-nums",
                isExpiresInWarning(sec)
                  ? "text-state-warning-text"
                  : "text-meta-foreground",
              )}
            >
              {expiresInLabel(sec)}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => <RowActions sandbox={info.row.original} />,
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
    getCoreRowModel: getCoreRowModel(),
  });

  // "Filtered" = anything narrowing the population vs the default view.
  // Status set is considered filtered when it differs from the defaults
  // (either subset OR superset — checking Terminated counts as a filter
  // change too).
  const statusFiltersChanged =
    statusFilters.length !== defaultStatusFilters.length ||
    statusFilters.some((s) => !defaultStatusFilters.includes(s));
  const isFiltered =
    search.trim() !== "" ||
    statusFiltersChanged ||
    regionFilter !== "all";

  function clearFilters() {
    onSearchChange("");
    onStatusFiltersChange(defaultStatusFilters);
    onRegionFilterChange("all");
  }

  const rows = table.getRowModel().rows;
  const showNoResults = rows.length === 0;

  // Overflow detection so the filter-count footer can sit inline with the
  // toolbar when the table fits the viewport, and drop to a footer line when
  // the table body scrolls. Sibling of the scroll container; ResizeObserver
  // fires on both viewport and content size changes. +1 epsilon avoids
  // flapping on sub-pixel fractional heights. Mirrors policies-table.
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setHasOverflow(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    const inner = el.firstElementChild;
    if (inner) ro.observe(inner);
    return () => ro.disconnect();
  }, [rows.length]);

  const filterCountLabel =
    isFiltered && rows.length > 0
      ? `${rows.length} of ${sandboxes.length}`
      : null;

  return (
    <div className="flex min-h-0 max-h-full flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <Toolbar
          search={search}
          onSearchChange={onSearchChange}
          statusFilters={statusFilters}
          onStatusFiltersChange={onStatusFiltersChange}
          regionFilter={regionFilter}
          onRegionFilterChange={onRegionFilterChange}
        />
        {filterCountLabel && !hasOverflow ? (
          <span
            className="typography-caption text-muted-foreground"
            aria-live="polite"
          >
            {filterCountLabel}
          </span>
        ) : null}
      </div>

      {/* Scroll container — only overflow boundary in the populated-list
        * region. Sticky <th>s (from tableHeadVariants `sticky top-0`) stay
        * pinned to the top of this region while the body scrolls. The page
        * chrome above (title, toolbar) sits outside.
        *
        * bg-muted-surface is duplicated on each <th> (alongside the shared
        * tableHeaderClass on <thead>) because position:sticky lifts the
        * <th> out of <thead>'s painted box — without an opaque bg on the
        * cell, scrolled rows show through the pinned header. Mirrors the
        * policies-table comment + pattern. */}
      <div
        ref={scrollRef}
        className="relative w-full min-h-0 flex-1 overflow-auto rounded-md border border-border bg-card"
      >
        <table className={tableClass}>
          <thead className={tableHeaderClass}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as
                    | { headerClassName?: string }
                    | undefined;
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        tableHeadVariants(),
                        "bg-muted-surface",
                        meta?.headerClassName,
                      )}
                    >
                      {!header.isPlaceholder &&
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
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
                    subtitle="Adjust your filters or search term."
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
                const href = `/${workspaceSlug}/sandboxes/${sbx.metadata.name}`;
                return (
                  <SandboxRow
                    key={row.id}
                    sandbox={sbx}
                    isFailed={isFailed}
                    href={href}
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

      {filterCountLabel && hasOverflow ? (
        <p
          className="shrink-0 typography-caption text-muted-foreground"
          aria-live="polite"
        >
          {filterCountLabel}
        </p>
      ) : null}
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
}

function Toolbar({
  search,
  onSearchChange,
  statusFilters,
  onStatusFiltersChange,
  regionFilter,
  onRegionFilterChange,
}: ToolbarProps) {
  // Single-row toolbar: Search (left anchor), Status + Region (right anchor).
  // No wrap on desktop — the previous two-row treatment was over-bloated
  // after the chips/terminated toggle were folded into the Status dropdown.
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
      </div>
    </div>
  );
}

interface SandboxRowProps {
  sandbox: Sandbox;
  isFailed: boolean;
  href: string;
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
  isFailed,
  onClick,
  onMouseEnter,
  cells,
  columnsCount,
}: SandboxRowProps) {
  function handleClick(event: React.MouseEvent<HTMLTableRowElement>) {
    const target = event.target as HTMLElement;
    if (target.closest("a, button, [role='menuitem'], [role='menu']")) return;
    onClick();
  }
  return (
    <>
      <tr
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        className={cn(
          tableRowVariants(),
          "group/sbx-row cursor-pointer",
          isFailed && "border-b-0",
        )}
      >
        {cells.map((cell) => (
          <td key={cell.key} className={cn(tableCellVariants(), cell.className)}>
            {cell.node}
          </td>
        ))}
      </tr>
      {isFailed && sandbox.failure ? (
        <tr className="border-b border-border bg-state-errored-subtle">
          <td colSpan={columnsCount} className="px-4 py-2">
            <div className="flex items-center gap-2 typography-caption text-state-errored-text">
              <AlertTriangle
                aria-hidden="true"
                className="size-3.5 shrink-0"
              />
              <span>
                {sandbox.failure.cause} — registry returned{" "}
                {sandbox.failure.httpStatus}.
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="ml-2 typography-caption text-state-errored-text underline-offset-2 hover:underline"
              >
                Retry
              </button>
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
