"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Info } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { CopyButton } from "@repo/ui/components/copy-button";
import { SearchInput } from "@repo/ui/components/search-input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import {
  tableBodyClass,
  tableCellVariants,
  tableClass,
  tableHeaderClass,
  tableRowVariants,
  tableHeadVariants,
} from "@repo/ui/components/table";
import type { Policy, PolicyType } from "@/lib/mock/policies";
import { totalUsage } from "@/lib/mock/policies";
import {
  appliesToLabel,
  attachedResourcesLabel,
  fullTimestamp,
  relativeUpdated,
  ruleSummary,
} from "./policies-row-helpers";

const SORT_OPTIONS = [
  { value: "updated", label: "Updated" },
  { value: "name", label: "Name" },
  { value: "usage", label: "Attached" },
] as const;
type SortKey = (typeof SORT_OPTIONS)[number]["value"];

const TYPE_OPTIONS: ReadonlyArray<{ value: PolicyType | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "location", label: "Location" },
  { value: "maxToken", label: "Token usage" },
  { value: "flavor", label: "Flavor" },
];

const columnHelper = createColumnHelper<Policy>();

interface PoliciesTableProps {
  policies: ReadonlyArray<Policy>;
}

export default function PoliciesTable({ policies }: PoliciesTableProps) {
  const params = useParams<{ workspaceSlugOrId: string }>();
  const router = useRouter();
  const workspaceSlug = params.workspaceSlugOrId;
  const [typeFilter, setTypeFilter] = useState<PolicyType | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("updated");
  const [search, setSearch] = useState("");

  const rows = useMemo<ReadonlyArray<Policy>>(() => {
    const normalized = search.trim().toLowerCase();
    const filtered = policies.filter((policy) => {
      if (typeFilter !== "all" && policy.spec.type !== typeFilter) return false;
      if (normalized) {
        const haystack = `${policy.metadata.displayName} ${policy.metadata.name} ${ruleSummary(policy)}`.toLowerCase();
        if (!haystack.includes(normalized)) return false;
      }
      return true;
    });
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sortKey === "name") {
        return a.metadata.displayName.localeCompare(b.metadata.displayName);
      }
      if (sortKey === "usage") {
        return totalUsage(b.usage) - totalUsage(a.usage);
      }
      return (
        new Date(b.metadata.updatedAt).getTime() -
        new Date(a.metadata.updatedAt).getTime()
      );
    });
    return sorted;
  }, [policies, typeFilter, sortKey, search]);

  const columns = useMemo(() => {
    return [
      columnHelper.accessor((row) => row.metadata.displayName, {
        id: "policy",
        header: "Policy",
        cell: (info) => {
          const policy = info.row.original;
          return (
            <div className="flex items-center gap-1.5">
              <div className="flex flex-col leading-tight">
                <span className="typography-body text-foreground underline-offset-4 group-hover/policy-row:underline">
                  {policy.metadata.displayName}
                </span>
                <span className="font-mono typography-meta text-muted-foreground">
                  {policy.metadata.name}
                </span>
              </div>
              {/* Copy sits beside the name — proximity to the thing being
                * copied. Row-level onClick guards against this button via
                * target.closest("a, button"), so the click is local. */}
              <span className="opacity-0 transition-opacity duration-fast ease-out-standard group-hover/policy-row:opacity-100 focus-within:opacity-100">
                <CopyButton
                  value={policy.metadata.name}
                  tooltipLabel="Copy policy name"
                />
              </span>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "rule",
        header: "Rule",
        cell: (info) => (
          <span className="typography-body text-foreground">
            {ruleSummary(info.row.original)}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.spec.resourceTypes, {
        id: "appliesTo",
        header: "Applies to",
        cell: (info) => (
          <span className="typography-body text-muted-foreground">
            {appliesToLabel(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.usage, {
        id: "attached",
        header: "Attached resources",
        cell: (info) => {
          const summary = attachedResourcesLabel(info.getValue());
          if (summary.unused) {
            return (
              <span
                className="typography-body text-muted-foreground"
                title="No workloads reference this policy — safe to delete."
              >
                {summary.label}
              </span>
            );
          }
          return (
            <span className="typography-body text-foreground">
              {summary.label}
            </span>
          );
        },
      }),
      columnHelper.accessor((row) => row.metadata.updatedAt, {
        id: "updated",
        header: "Updated",
        cell: (info) => {
          const iso = info.getValue() as string;
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <time
                  dateTime={iso}
                  className="typography-body text-muted-foreground"
                >
                  {relativeUpdated(iso)}
                </time>
              </TooltipTrigger>
              <TooltipContent>{fullTimestamp(iso)}</TooltipContent>
            </Tooltip>
          );
        },
      }),
    ];
  }, []);

  const table = useReactTable({
    data: rows as Policy[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Overflow detection so the count can sit inline with the filter row when
  // the table fits the viewport, and drop to a footer line when the table
  // body scrolls. ResizeObserver fires on both viewport and content size
  // changes; the +1 epsilon avoids flapping on sub-pixel fractional heights.
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

  const countLabel = `${rows.length} ${rows.length === 1 ? "policy" : "policies"}`;

  return (
    <div className="flex min-h-0 max-h-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <div className="w-full sm:max-w-xs">
          <SearchInput
            defaultValue=""
            onLiveChange={setSearch}
            placeholder="Search policies…"
            aria-label="Search policies"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(value) => setTypeFilter(value as PolicyType | "all")}
        >
          <SelectTrigger className="w-48" aria-label="Filter by type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                Type: {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-40" aria-label="Sort by">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                Sort: {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!hasOverflow ? (
          <span
            className="typography-caption text-muted-foreground"
            aria-live="polite"
          >
            {countLabel}
          </span>
        ) : null}
        <div className="ml-auto">
          <EvaluationRulesHelp />
        </div>
      </div>

      {/* Scroll container — owns the only overflow boundary so the sticky
        * column header (declared on tableHeadVariants) stays pinned to the
        * top of this region while the body scrolls. The page chrome above
        * (filter row) and below (count line) sit outside this container.
        *
        * Sizing: no `flex-1`. The container takes its content height by
        * default — with 4 rows the card border stops right under row 4,
        * no empty stretched whitespace. When content exceeds the parent
        * cap (root `max-h-full`), `min-h-0 + overflow-auto` activates and
        * the body scrolls while sticky `<th>`s stay pinned. */}
      <div
        ref={scrollRef}
        className="relative w-full min-h-0 overflow-auto rounded-md border border-border bg-card"
      >
        <table className={tableClass}>
          <thead className={tableHeaderClass}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  // bg-field-rest is duplicated from the shared tableHeaderClass
                  // on <thead> because position:sticky lifts the <th> out of
                  // the thead's painted box — without an opaque bg on the cell
                  // itself, scrolled rows show through the pinned header.
                  <th
                    key={header.id}
                    className={cn(tableHeadVariants({ density: "compact" }), "bg-field-rest")}
                  >
                    {!header.isPlaceholder &&
                      flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className={tableBodyClass}>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No policies match these filters.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const policy = row.original;
                const href = `/${workspaceSlug}/policies/${policy.metadata.name}`;
                // Whole-row navigation matches the dashboard table convention
                // (see custom-domains). Skip the push when the click lands on
                // an interactive descendant (button, anchor) so the trailing
                // actions cell stays a clean action zone — no cmd/middle-click
                // surprises either.
                const onRowClick = (
                  event: React.MouseEvent<HTMLTableRowElement>,
                ) => {
                  const target = event.target as HTMLElement;
                  if (target.closest("a, button")) return;
                  if (event.defaultPrevented) return;
                  router.push(href);
                };
                return (
                  <tr
                    key={row.id}
                    onClick={onRowClick}
                    onMouseEnter={() => router.prefetch(href)}
                    className={cn(
                      tableRowVariants({ density: "compact" }),
                      "group/policy-row cursor-pointer",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className={cn(tableCellVariants({ density: "compact" }))}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {hasOverflow ? (
        <p
          className="typography-caption text-muted-foreground shrink-0"
          aria-live="polite"
        >
          {countLabel}
        </p>
      ) : null}
    </div>
  );
}

function EvaluationRulesHelp() {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-1.5 py-1",
          "typography-caption text-muted-foreground hover:text-foreground",
          "transition-colors",
        )}
        aria-label="Evaluation rules"
      >
        <Info aria-hidden="true" className="size-3.5" />
        Evaluation rules
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="max-w-sm"
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="typography-label font-medium text-foreground">
              How policies combine
            </span>
            <p className="typography-body text-muted-foreground">
              When more than one policy applies to a workload, Blaxel combines
              them by type before deciding whether the workload can run.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="typography-label font-medium text-foreground">
              Within a type — UNION (OR)
            </span>
            <p className="typography-body text-muted-foreground">
              Two Location policies allow any location named by either policy.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="typography-label font-medium text-foreground">
              Across types — INTERSECTION (AND)
            </span>
            <p className="typography-body text-muted-foreground">
              A Location and a Token usage policy both must pass for the
              workload to run.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
