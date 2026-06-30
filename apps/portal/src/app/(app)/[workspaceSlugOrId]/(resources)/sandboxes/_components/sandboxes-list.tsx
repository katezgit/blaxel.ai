"use client";

import { useMemo, useState } from "react";
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
import { StatePill, pillFor, type SandboxStateLabel } from "./state-pill";
import {
  expiresInLabel,
  imageRefLabel,
  isExpiresInWarning,
  regionLabel,
} from "./row-helpers";
import { SandboxesEmptyState } from "./sandboxes-empty-state";

const QUICK_FILTERS: ReadonlyArray<{
  value: SandboxStateLabel;
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

interface SandboxesListProps {
  sandboxes: ReadonlyArray<Sandbox>;
  workspaceSlug: string;
  createHref: string;
}

const columnHelper = createColumnHelper<Sandbox>();

export function SandboxesList({
  sandboxes,
  workspaceSlug,
  createHref,
}: SandboxesListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [stateFilters, setStateFilters] = useState<ReadonlyArray<string>>([]);
  const [regionFilter, setRegionFilter] = useState<SandboxRegion | "all">("all");
  const [includeTerminated, setIncludeTerminated] = useState(false);

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
      if (stateFilters.length > 0 && !stateFilters.includes(pillLabel)) {
        return false;
      }
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
  }, [sandboxes, search, stateFilters, regionFilter, includeTerminated]);

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
    includeTerminated;

  function clearFilters() {
    setSearch("");
    setStateFilters([]);
    setRegionFilter("all");
    setIncludeTerminated(false);
  }

  if (sandboxes.length === 0) {
    return <SandboxesEmptyState createHref={createHref} />;
  }

  const rows = table.getRowModel().rows;
  const showNoResults = rows.length === 0;

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <Toolbar
        search={search}
        onSearchChange={setSearch}
        stateFilters={stateFilters}
        onStateFiltersChange={setStateFilters}
        regionFilter={regionFilter}
        onRegionFilterChange={setRegionFilter}
        includeTerminated={includeTerminated}
        onIncludeTerminatedChange={setIncludeTerminated}
      />

      <div className="relative w-full overflow-x-auto rounded-md border border-border bg-card">
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
                      className={cn(tableHeadVariants(), meta?.headerClassName)}
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

      {isFiltered && rows.length > 0 ? (
        <p
          className="shrink-0 typography-caption text-muted-foreground"
          aria-live="polite"
        >
          {rows.length} of {sandboxes.length}
        </p>
      ) : null}
    </div>
  );
}

interface ToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  stateFilters: ReadonlyArray<string>;
  onStateFiltersChange: (value: ReadonlyArray<string>) => void;
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
          onChange={(next) => onStateFiltersChange(next)}
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
