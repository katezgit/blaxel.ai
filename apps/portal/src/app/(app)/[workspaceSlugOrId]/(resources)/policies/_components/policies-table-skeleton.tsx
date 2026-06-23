"use client";

import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/cn";

const ROW_COUNT = 4;
const COL_TEMPLATE = "grid-cols-[2fr_1fr_1.5fr_1fr_1fr]";

// Silhouette mirror of the live PoliciesTable: filter row, header columns,
// row layout, and trailing count line. Same widths and column template so the
// swap-in is invisible — only the content text fades in.
export default function PoliciesTableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Filter row: search + type + sort + evaluation rules trigger. Matches
        * the live `flex flex-wrap items-center gap-3` row at the top of the
        * table view so the chrome doesn't shift on data arrival. */}
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 w-full rounded-md sm:max-w-xs" />
        <Skeleton className="h-9 w-40 rounded-md" />
        <Skeleton className="h-9 w-40 rounded-md" />
        <Skeleton className="ml-auto h-9 w-32 rounded-md" />
      </div>

      <div className="relative w-full overflow-hidden rounded-md border border-border bg-card">
        <div
          className={cn(
            "grid gap-4 border-b border-border bg-field-rest px-4 py-3 typography-table-header text-muted-foreground",
            COL_TEMPLATE,
          )}
        >
          <span>Policy</span>
          <span>Rule</span>
          <span>Applies to</span>
          <span>Attached resources</span>
          <span>Updated</span>
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: ROW_COUNT }).map((_, idx) => (
            <div
              key={idx}
              className={cn("grid items-center gap-4 px-4 py-3", COL_TEMPLATE)}
            >
              {/* Policy: displayName (typography-body 14px) over slug
                * (typography-meta 10px mono) — matches the stacked cell. */}
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3.5 w-36 rounded-sm" />
                <Skeleton className="h-2.5 w-16 rounded-sm" />
              </div>
              <Skeleton className="h-3.5 w-40 rounded-sm" />
              <Skeleton className="h-3.5 w-44 rounded-sm" />
              <Skeleton className="h-3.5 w-28 rounded-sm" />
              <Skeleton className="h-3.5 w-14 rounded-sm" />
            </div>
          ))}
        </div>
      </div>

      <Skeleton className="h-3 w-20 rounded-sm" />
    </div>
  );
}
