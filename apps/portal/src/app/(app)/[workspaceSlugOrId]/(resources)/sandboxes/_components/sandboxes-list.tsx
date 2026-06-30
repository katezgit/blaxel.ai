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
import { Chip, ChipGroup } from "@repo/ui/components/chip";
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
import type { StateBreakdownLabel } from "./aggregate-data";
import {
  expiresInLabel,
  imageRefLabel,
  isExpiresInWarning,
  regionLabel,
} from "./row-helpers";

const QUICK_FILTERS: ReadonlyArray<{
  value: StateBreakdownLabel;
  label: string;
}> = [
  { value: "Active", label: "Active" },
  { value: "Standby", label: "Standby" },
  { value: "Errored", label: "Errored" },
];

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
  // Filter state is owned by the parent (sandboxes-view) so both the strip
  // and the toolbar dispatch into the same source of truth — they cannot
  // desync. See wireframe §1.3 click-to-filter contract.
  search: string;
  onSearchChange: (value: string) => void;
  stateFilters: ReadonlyArray<StateBreakdownLabel>;
  onStateFiltersChange: (
    value: ReadonlyArray<StateBreakdownLabel>,
  ) => void;
  regionFilter: SandboxRegion | "all";
  onRegionFilterChange: (value: SandboxRegion | "all") => void;
  /** Image filter — single-select; null = unfiltered. Identity = `<name>@<sha>`. */
  imageFilter: string | null;
  onImageFilterChange: (value: string | null) => void;
  includeTerminated: boolean;
  onIncludeTerminatedChange: (value: boolean) => void;
}

const columnHelper = createColumnHelper<Sandbox>();

export function SandboxesList({
  sandboxes,
  workspaceSlug,
  search,
  onSearchChange,
  stateFilters,
  onStateFiltersChange,
  regionFilter,
  onRegionFilterChange,
  imageFilter,
  onImageFilterChange,
  includeTerminated,
  onIncludeTerminatedChange,
}: SandboxesListProps) {
  const router = useRouter();

  // Visible rows. Terminated/Inactive are hidden by default — the "Include
  // terminated" chip is the wireframe's escape hatch.
  const visible = useMemo<ReadonlyArray<Sandbox>>(() => {
    const normalized = search.trim().toLowerCase();
    return sandboxes.filter((sbx) => {
      const pillLabel = pillFor(sbx).label;
      if (
        !includeTerminated &&
        (pillLabel === "Terminated" || pillLabel === "Inactive")
      ) {
        return false;
      }
      if (
        stateFilters.length > 0 &&
        !stateFilters.includes(pillLabel as StateBreakdownLabel)
      ) {
        return false;
      }
      if (regionFilter !== "all" && sbx.spec.region !== regionFilter) {
        return false;
      }
      if (
        imageFilter !== null &&
        `${sbx.spec.image.name}@${sbx.spec.image.sha}` !== imageFilter
      ) {
        return false;
      }
      if (normalized) {
        const haystack =
          `${sbx.metadata.displayName} ${sbx.metadata.name} ${sbx.metadata.externalId}`.toLowerCase();
        if (!haystack.includes(normalized)) return false;
      }
      return true;
    });
  }, [
    sandboxes,
    search,
    stateFilters,
    regionFilter,
    imageFilter,
    includeTerminated,
  ]);

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

  const isFiltered =
    search.trim() !== "" ||
    stateFilters.length > 0 ||
    regionFilter !== "all" ||
    imageFilter !== null ||
    includeTerminated;

  function clearFilters() {
    onSearchChange("");
    onStateFiltersChange([]);
    onRegionFilterChange("all");
    onImageFilterChange(null);
    onIncludeTerminatedChange(false);
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
          stateFilters={stateFilters}
          onStateFiltersChange={onStateFiltersChange}
          regionFilter={regionFilter}
          onRegionFilterChange={onRegionFilterChange}
          includeTerminated={includeTerminated}
          onIncludeTerminatedChange={onIncludeTerminatedChange}
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
        * chrome above (title, strip, toolbar) sits outside.
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
                const isErrored = pill.label === "Errored";
                const href = `/${workspaceSlug}/sandboxes/${sbx.metadata.name}`;
                return (
                  <SandboxRow
                    key={row.id}
                    sandbox={sbx}
                    isErrored={isErrored}
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
  stateFilters: ReadonlyArray<StateBreakdownLabel>;
  onStateFiltersChange: (value: ReadonlyArray<StateBreakdownLabel>) => void;
  regionFilter: SandboxRegion | "all";
  onRegionFilterChange: (value: SandboxRegion | "all") => void;
  includeTerminated: boolean;
  onIncludeTerminatedChange: (value: boolean) => void;
}

function Toolbar({
  search,
  onSearchChange,
  stateFilters,
  onStateFiltersChange,
  regionFilter,
  onRegionFilterChange,
  includeTerminated,
  onIncludeTerminatedChange,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 shrink-0">
      <div className="w-full sm:max-w-xs">
        <SearchInput
          defaultValue={search}
          onLiveChange={onSearchChange}
          placeholder="Search name or ID…"
          aria-label="Search Sandboxes"
        />
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <ChipGroup
          value={[...stateFilters]}
          onChange={(next) =>
            onStateFiltersChange(next as ReadonlyArray<StateBreakdownLabel>)
          }
          aria-label="Filter by state"
        >
          {QUICK_FILTERS.map((filter) => (
            <Chip key={filter.value} value={filter.value}>
              {filter.label}
            </Chip>
          ))}
        </ChipGroup>
        <Chip
          checked={includeTerminated}
          onCheckedChange={onIncludeTerminatedChange}
        >
          Include terminated
        </Chip>
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
  isErrored: boolean;
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
  isErrored,
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
          isErrored && "border-b-0",
        )}
      >
        {cells.map((cell) => (
          <td key={cell.key} className={cn(tableCellVariants(), cell.className)}>
            {cell.node}
          </td>
        ))}
      </tr>
      {isErrored && sandbox.failureReason ? (
        <tr className="border-b border-border bg-state-errored-subtle">
          <td colSpan={columnsCount} className="px-4 py-2">
            <div className="flex items-center gap-2 typography-caption text-state-errored-text">
              <AlertTriangle
                aria-hidden="true"
                className="size-3.5 shrink-0"
              />
              <span>{sandbox.failureReason}</span>
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
