"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  { value: "all", label: "All types" },
  { value: "location", label: "Location" },
  { value: "maxToken", label: "Token usage" },
  { value: "flavor", label: "Flavor" },
];

const columnHelper = createColumnHelper<Policy>();

interface PoliciesTableProps {
  policies: ReadonlyArray<Policy>;
}

export function PoliciesTable({ policies }: PoliciesTableProps) {
  const params = useParams<{ workspaceSlugOrId: string }>();
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
            <Link
              href={`/${workspaceSlug}/policies/${policy.metadata.name}`}
              className="flex flex-col leading-tight hover:underline"
            >
              <span className="typography-body font-medium text-foreground">
                {policy.metadata.displayName}
              </span>
              <span className="font-mono typography-meta text-muted-foreground">
                {policy.metadata.name}
              </span>
            </Link>
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
  }, [workspaceSlug]);

  const table = useReactTable({
    data: rows as Policy[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
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
          <SelectTrigger className="w-40" aria-label="Filter by type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
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
        <div className="ml-auto">
          <EvaluationRulesHelp />
        </div>
      </div>

      <div className="relative w-full overflow-hidden overflow-x-auto rounded-md border border-border bg-card">
        <table className={tableClass}>
          <thead className={tableHeaderClass}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className={cn(tableHeadVariants({ density: "compact" }))}>
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
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className={cn(tableRowVariants({ density: "compact" }))}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={cn(tableCellVariants({ density: "compact" }))}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="typography-caption text-muted-foreground">
        {rows.length} {rows.length === 1 ? "policy" : "policies"}
      </p>
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
              Two Location policies allow any region named by either policy.
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
