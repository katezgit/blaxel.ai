"use client";

import { cn } from "@repo/ui/lib/cn";

// Loading variant of the aggregate strip — four skeleton groups matching the
// live strip's footprint. Section-label band removed (the strip no longer
// renders them). Count placeholders are taller (h-4) than label placeholders
// (h-3) so the silhouette matches the read-first count typography.
// Total group's count placeholder mimics the larger display number with a
// stacked sub-label, vertically centered.

export function SandboxesAggregateStripSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_1.5fr] lg:gap-0"
    >
      <SkeletonTotalGroup />
      <SkeletonRowsGroup
        rows={[
          { left: "w-14", right: "w-7" },
          { left: "w-14", right: "w-7" },
          { left: "w-14", right: "w-7" },
        ]}
      />
      <SkeletonRowsGroup
        rows={[
          { left: "w-20", right: "w-7" },
          { left: "w-20", right: "w-7" },
          { left: "w-20", right: "w-7" },
        ]}
      />
      <SkeletonRowsGroup
        rows={[
          { left: "w-32", right: "w-7" },
          { left: "w-32", right: "w-7" },
          { left: "w-32", right: "w-7" },
        ]}
      />
    </section>
  );
}

function SkeletonTotalGroup() {
  return (
    <div className="flex flex-col justify-center px-4 py-3">
      <div className="flex flex-col px-3">
        <div className="h-6 w-14 animate-pulse rounded-sm bg-muted-surface" />
        <div className="mt-1 h-3 w-16 animate-pulse rounded-sm bg-muted-surface" />
      </div>
    </div>
  );
}

interface SkeletonRowsGroupProps {
  rows: ReadonlyArray<{ left: string; right: string }>;
}

function SkeletonRowsGroup({ rows }: SkeletonRowsGroupProps) {
  return (
    <div className="flex flex-col px-4 py-3 lg:border-l lg:border-border">
      <div className="flex flex-col">
        {rows.map((row, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-3 py-0.5 pl-3 pr-2"
          >
            <div
              className={cn(
                "h-3 animate-pulse rounded-sm bg-muted-surface",
                row.left,
              )}
            />
            <div
              className={cn(
                "h-4 animate-pulse rounded-sm bg-muted-surface",
                row.right,
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
