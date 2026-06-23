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
  tableBodyClass,
  tableCellVariants,
  tableClass,
  tableHeaderClass,
  tableRowVariants,
  tableHeadVariants,
} from "@repo/ui/components/table";
import type { Policy, PolicyResourceType, PolicyType } from "@/lib/mock/policies";
import {
  joinResourceTypes,
  policyTypeLabel,
  totalUsage,
} from "@/lib/mock/policies";

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const SORT_OPTIONS = [
  { value: "updated", label: "Updated" },
  { value: "name", label: "Name" },
  { value: "usage", label: "Usage" },
] as const;
type SortKey = (typeof SORT_OPTIONS)[number]["value"];

const TYPE_OPTIONS: ReadonlyArray<{ value: PolicyType | "all"; label: string }> = [
  { value: "all", label: "All types" },
  { value: "location", label: "Location" },
  { value: "maxToken", label: "Token usage" },
  { value: "flavor", label: "Flavor" },
];

const TARGET_OPTIONS: ReadonlyArray<{
  value: PolicyResourceType | "all";
  label: string;
}> = [
  { value: "all", label: "All targets" },
  { value: "agent", label: "Agents" },
  { value: "model", label: "Model APIs" },
  { value: "function", label: "MCP Servers" },
  { value: "sandbox", label: "Sandboxes" },
  { value: "application", label: "Applications" },
];

const columnHelper = createColumnHelper<Policy>();

interface PoliciesTableProps {
  policies: ReadonlyArray<Policy>;
}

export function PoliciesTable({ policies }: PoliciesTableProps) {
  const params = useParams<{ workspaceSlugOrId: string }>();
  const workspaceSlug = params.workspaceSlugOrId;
  const [typeFilter, setTypeFilter] = useState<PolicyType | "all">("all");
  const [targetFilter, setTargetFilter] = useState<PolicyResourceType | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("updated");
  const [search, setSearch] = useState("");

  const rows = useMemo<ReadonlyArray<Policy>>(() => {
    const normalized = search.trim().toLowerCase();
    const filtered = policies.filter((policy) => {
      if (typeFilter !== "all" && policy.spec.type !== typeFilter) return false;
      if (
        targetFilter !== "all" &&
        !policy.spec.resourceTypes.includes(targetFilter)
      ) {
        return false;
      }
      if (normalized) {
        const haystack = `${policy.metadata.displayName} ${policy.metadata.name}`.toLowerCase();
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
      // updated, descending
      return (
        new Date(b.metadata.updatedAt).getTime() -
        new Date(a.metadata.updatedAt).getTime()
      );
    });
    return sorted;
  }, [policies, typeFilter, targetFilter, sortKey, search]);

  const columns = useMemo(() => {
    return [
      columnHelper.accessor((row) => row.metadata.displayName, {
        id: "name",
        header: "Name",
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
      columnHelper.accessor((row) => row.spec.type, {
        id: "type",
        header: "Type",
        cell: (info) => {
          const type = info.getValue() as PolicyType;
          return (
            <span className="inline-flex items-center gap-2">
              <span className="typography-body text-foreground">
                {policyTypeLabel(type)}
              </span>
              {type === "flavor" && (
                <span className="typography-meta text-muted-foreground">
                  [coming soon]
                </span>
              )}
            </span>
          );
        },
      }),
      columnHelper.accessor((row) => row.spec.resourceTypes, {
        id: "targets",
        header: "Targets",
        cell: (info) => (
          <span className="text-muted-foreground">
            {joinResourceTypes(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.usage, {
        id: "usage",
        header: "Usage",
        cell: (info) => {
          const policy = info.row.original;
          return <PolicyUsageCell policy={policy} />;
        },
      }),
      columnHelper.accessor((row) => row.metadata.updatedAt, {
        id: "updated",
        header: "Updated",
        cell: (info) => (
          <time
            dateTime={info.getValue() as string}
            title={new Date(info.getValue() as string).toUTCString()}
            className="font-mono typography-meta text-muted-foreground"
          >
            {DATE_FMT.format(new Date(info.getValue() as string))}
          </time>
        ),
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
        <Select
          value={targetFilter}
          onValueChange={(value) =>
            setTargetFilter(value as PolicyResourceType | "all")
          }
        >
          <SelectTrigger className="w-44" aria-label="Filter by target">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TARGET_OPTIONS.map((option) => (
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
      </div>

      <div className="relative w-full overflow-hidden overflow-x-auto rounded-md border border-border bg-card">
        <table className={tableClass}>
          <thead className={tableHeaderClass}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className={cn(tableHeadVariants())}>
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
                <tr key={row.id} className={cn(tableRowVariants())}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={cn(tableCellVariants())}>
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
        {rows.length} {rows.length === 1 ? "policy" : "policies"} ·{" "}
        Combination rule: UNION within type (OR) · INTERSECTION across types (AND)
      </p>
    </div>
  );
}

// Per-kind usage breakdown rendered as a joined list of non-zero counts.
// Zero across all kinds renders in amber-muted to satisfy
// "failure outranks success" — a policy enforcing nothing is the
// Sam-audit concern and the Alex-cleanup trigger (Scenario 5).
function PolicyUsageCell({ policy }: { policy: Policy }) {
  const { usage } = policy;
  const total = totalUsage(usage);
  if (total === 0) {
    return (
      <span
        className="font-mono typography-meta tabular-nums text-state-warning-text"
        title="No workloads reference this policy — safe to delete."
      >
        0
      </span>
    );
  }
  const parts: string[] = [];
  if (usage.agents > 0) parts.push(`${usage.agents} Agents`);
  if (usage.models > 0) parts.push(`${usage.models} Model APIs`);
  if (usage.functions > 0) parts.push(`${usage.functions} MCP Servers`);
  if (usage.sandboxes > 0) parts.push(`${usage.sandboxes} Sandboxes`);
  if (usage.jobs > 0) parts.push(`${usage.jobs} Jobs`);
  return (
    <span className="font-mono typography-meta tabular-nums text-foreground">
      {parts.join(" · ")}
    </span>
  );
}
