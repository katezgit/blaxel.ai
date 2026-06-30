"use client";

import { cn } from "@repo/ui/lib/cn";

// Loading variant of the aggregate strip — four equal-width skeleton groups
// matching the live strip's footprint (label band on top, three rows below).
// Pattern mirrors `sandboxes-table-skeleton.tsx`: animate-pulse + bg-muted.

export function SandboxesAggregateStripSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_1.5fr] lg:gap-0"
    >
      {SKELETON_GROUPS.map((group, idx) => (
        <SkeletonGroup
          key={idx}
          first={idx === 0}
          labelWidth={group.labelWidth}
          rows={group.rows}
        />
      ))}
    </section>
  );
}

const SKELETON_GROUPS: ReadonlyArray<{
  labelWidth: string;
  rows: ReadonlyArray<{ left: string; right: string }>;
}> = [
  {
    labelWidth: "w-10",
    rows: [{ left: "w-14 h-6", right: "" }],
  },
  {
    labelWidth: "w-12",
    rows: [
      { left: "w-16", right: "w-6" },
      { left: "w-16", right: "w-6" },
      { left: "w-16", right: "w-6" },
    ],
  },
  {
    labelWidth: "w-14",
    rows: [
      { left: "w-20", right: "w-6" },
      { left: "w-20", right: "w-6" },
      { left: "w-20", right: "w-6" },
    ],
  },
  {
    labelWidth: "w-20",
    rows: [
      { left: "w-32", right: "w-6" },
      { left: "w-32", right: "w-6" },
      { left: "w-32", right: "w-6" },
    ],
  },
];

interface SkeletonGroupProps {
  first: boolean;
  labelWidth: string;
  rows: ReadonlyArray<{ left: string; right: string }>;
}

function SkeletonGroup({ first, labelWidth, rows }: SkeletonGroupProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 px-4 py-3",
        !first && "lg:border-l lg:border-border",
      )}
    >
      <div className={cn("h-3 animate-pulse rounded-sm bg-muted-surface", labelWidth)} />
      <div className="flex flex-col gap-2 pt-1">
        {rows.map((row, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-3 pl-3 pr-2"
          >
            <div
              className={cn("h-3 animate-pulse rounded-sm bg-muted-surface", row.left)}
            />
            {row.right ? (
              <div
                className={cn("h-3 animate-pulse rounded-sm bg-muted-surface", row.right)}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
