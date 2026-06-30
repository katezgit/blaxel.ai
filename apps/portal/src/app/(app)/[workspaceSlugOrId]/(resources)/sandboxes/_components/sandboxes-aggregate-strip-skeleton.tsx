"use client";

import { cn } from "@repo/ui/lib/cn";

// Loading variant of the aggregate strip — three skeleton groups matching the
// live strip's footprint (State / Region / Top Image). Total moved to the
// page-header subtitle, so its skeleton lives outside the strip. The State
// group's first row is taller (h-6) to mirror the Errored hero count.

export function SandboxesAggregateStripSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.5fr] lg:gap-0"
    >
      <SkeletonStateGroup />
      <SkeletonRowsGroup
        rows={[
          { left: "w-20", right: "w-7" },
          { left: "w-20", right: "w-7" },
          { left: "w-20", right: "w-7" },
        ]}
        first
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

function SkeletonStateGroup() {
  return (
    <div className="flex flex-col px-4 py-3">
      <div className="flex flex-col">
        {/* Errored hero row — taller right cell mirrors the typography-display
            count rendered in the live strip. */}
        <div className="flex items-center justify-between gap-3 py-1 pl-3 pr-2">
          <div className="h-3 w-14 animate-pulse rounded-sm bg-muted-surface" />
          <div className="h-6 w-9 animate-pulse rounded-sm bg-muted-surface" />
        </div>
        {[0, 1].map((idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-3 py-0.5 pl-3 pr-2"
          >
            <div className="h-3 w-14 animate-pulse rounded-sm bg-muted-surface" />
            <div className="h-4 w-7 animate-pulse rounded-sm bg-muted-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface SkeletonRowsGroupProps {
  rows: ReadonlyArray<{ left: string; right: string }>;
  first?: boolean;
}

function SkeletonRowsGroup({ rows, first }: SkeletonRowsGroupProps) {
  return (
    <div
      className={cn(
        "flex flex-col px-4 py-3",
        !first && "lg:border-l lg:border-border",
      )}
    >
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
