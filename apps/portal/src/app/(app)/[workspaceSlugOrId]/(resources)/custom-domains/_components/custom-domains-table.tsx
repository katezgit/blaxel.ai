"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CopyButton } from "@repo/ui/components/copy-button";
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
import { cn } from "@repo/ui/lib/cn";
import type { CustomDomain, CustomDomainStatus } from "@/lib/mock/custom-domains";
import { formatRegion } from "../_lib/region";
import { formatRelative } from "../_lib/relative-time";
import DomainStatusBadge from "./status-badge";

interface CustomDomainsTableProps {
  domains: ReadonlyArray<CustomDomain>;
}

const STATUS_ORDER: Record<CustomDomainStatus, number> = {
  failed: 0,
  pending: 1,
  verified: 2,
};

function statusOrder(s: CustomDomainStatus): number {
  return STATUS_ORDER[s];
}

// personality.md §7 — failure outranks success: failed rows sort to the top,
// then pending, then verified. Within a group, newest-first by createdAt.
function sortDomains(domains: ReadonlyArray<CustomDomain>): ReadonlyArray<CustomDomain> {
  return [...domains].sort((a, b) => {
    const orderDiff = statusOrder(a.spec.status) - statusOrder(b.spec.status);
    if (orderDiff !== 0) return orderDiff;
    return (
      Date.parse(b.metadata.createdAt) - Date.parse(a.metadata.createdAt)
    );
  });
}

type StatusFilter = "all" | CustomDomainStatus;

const STATUS_OPTIONS: ReadonlyArray<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "failed", label: "Failed" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
];

function filterDomains(
  domains: ReadonlyArray<CustomDomain>,
  search: string,
  statusFilter: StatusFilter,
): ReadonlyArray<CustomDomain> {
  const normalized = search.trim().toLowerCase();
  return domains.filter((domain) => {
    if (statusFilter !== "all" && domain.spec.status !== statusFilter) {
      return false;
    }
    if (normalized.length > 0) {
      const inName = domain.metadata.name.toLowerCase().includes(normalized);
      const inDisplay = domain.metadata.displayName
        ?.toLowerCase()
        .includes(normalized) ?? false;
      if (!inName && !inDisplay) return false;
    }
    return true;
  });
}

export default function CustomDomainsTable({ domains }: CustomDomainsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const params = useParams<{ workspaceSlugOrId: string }>();
  const workspaceSlug = params.workspaceSlugOrId;

  const filteredAndSorted = useMemo(
    () => sortDomains(filterDomains(domains, search, statusFilter)),
    [domains, search, statusFilter],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:max-w-xs">
          <SearchInput
            defaultValue=""
            onLiveChange={setSearch}
            placeholder="Search domains…"
            aria-label="Search domains"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          {/* SelectValue children override the auto-bound text — preserves
              the data-slot Radix layout while displaying "Status: X" so a
              single token like "Failed" never reads as orphaned context. */}
          <SelectTrigger className="w-40" aria-label="Filter by status">
            <SelectValue>
              {statusFilter === "all"
                ? "All statuses"
                : `Status: ${STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative w-full overflow-hidden overflow-x-auto rounded-md border border-border bg-card">
        <table className={tableClass} aria-label="Custom domains">
          <thead className={tableHeaderClass}>
            <tr>
              <th className={tableHeadVariants()}>Domain</th>
              <th className={tableHeadVariants()}>Region</th>
              <th className={tableHeadVariants()}>Status</th>
              <th className={tableHeadVariants()}>Last verified</th>
            </tr>
          </thead>
          <tbody className={tableBodyClass}>
            {filteredAndSorted.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center typography-body text-muted-foreground"
                >
                  No domains match these filters.
                </td>
              </tr>
            ) : (
              filteredAndSorted.map((domain) => (
                <DomainRow
                  key={domain.metadata.name}
                  domain={domain}
                  workspaceSlug={workspaceSlug}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface DomainRowProps {
  domain: CustomDomain;
  workspaceSlug: string;
}

function DomainRow({ domain, workspaceSlug }: DomainRowProps) {
  const router = useRouter();
  const { metadata, spec } = domain;
  const href = `/${workspaceSlug}/custom-domains/${encodeURIComponent(metadata.name)}`;
  const isFailed = spec.status === "failed";
  const region = formatRegion(spec.region);

  // Row-level navigation so the entire `cursor-pointer` surface is live, not
  // just the inner Link in the first cell. Skip when the click originates on
  // an interactive descendant (the Link, a button, or the copy-error link in
  // the error row below) so cmd/middle-click and inner actions keep their
  // native semantics.
  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("a, button")) return;
    if (event.defaultPrevented) return;
    router.push(href);
  };

  return (
    <>
      <tr
        onClick={handleRowClick}
        onMouseEnter={() => router.prefetch(href)}
        className={cn(
          tableRowVariants(),
          "group cursor-pointer",
          // personality.md §7 — failure outranks success.
          isFailed && "bg-state-errored-subtle hover:bg-state-errored-subtle border-b-0",
        )}
      >
        <td
          className={cn(
            tableCellVariants(),
            isFailed && "relative",
          )}
        >
          {isFailed && (
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-0.5 bg-state-errored"
            />
          )}
          <div className="flex items-start gap-1.5">
            <Link
              href={href}
              className="flex flex-col gap-0.5 rounded-sm font-mono"
            >
              <span className="text-foreground underline-offset-4 group-hover:underline">
                {metadata.name}
              </span>
              {metadata.displayName && (
                <span className="font-sans typography-caption text-muted-foreground">
                  {metadata.displayName}
                </span>
              )}
            </Link>
            <CopyButton
              value={metadata.name}
              tooltipLabel="Copy domain"
              className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            />
          </div>
          <LabelChips labels={metadata.labels} />
        </td>
        <td className={cn(tableCellVariants(), "text-muted-foreground")}>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="text-base leading-none">{region.flag}</span>
            <span className="text-foreground">{region.label}</span>
            {region.label !== region.slug && (
              <span className="font-mono text-muted-foreground">({region.slug})</span>
            )}
          </span>
        </td>
        <td className={tableCellVariants()}>
          <DomainStatusBadge status={spec.status} />
        </td>
        <td className={cn(tableCellVariants(), "text-muted-foreground")}>
          {formatRelative(spec.lastVerifiedAt)}
        </td>
      </tr>
      {isFailed && spec.verificationError && (
        // Continuation of the failed row above: shares the errored-subtle bg
        // and the left-border accent extends through this row so the eye
        // reads it as bound to the failed row, not the next one. Bottom
        // divider is the same `border-border` every other row uses — no need
        // to shout a state-errored border at the page; the bg + left bar
        // carry the "this is part of the failure" signal on their own.
        <tr className="bg-state-errored-subtle border-b border-border">
          <td colSpan={4} className="relative px-6 pb-3 typography-caption text-state-errored-text">
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-0.5 bg-state-errored"
            />
            <span className="font-medium">
              {extractFirstLine(spec.verificationError)}
            </span>{" "}
            <Link
              href={href}
              className="rounded-sm font-medium underline-offset-2 outline-hidden hover:underline focus-visible:shadow-focus-ring"
            >
              View record to publish →
            </Link>
          </td>
        </tr>
      )}
    </>
  );
}

function LabelChips({ labels }: { labels: Record<string, string> }) {
  const entries = Object.entries(labels);
  if (entries.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {entries.map(([key, value]) => (
        <span
          key={key}
          className="inline-flex items-center rounded-sm bg-muted-surface px-1.5 py-0.5 font-mono typography-meta text-muted-foreground"
        >
          {key}:{value}
        </span>
      ))}
    </div>
  );
}

function extractFirstLine(text: string): string {
  const newline = text.indexOf(".");
  if (newline > 0) return text.slice(0, newline + 1);
  return text;
}
