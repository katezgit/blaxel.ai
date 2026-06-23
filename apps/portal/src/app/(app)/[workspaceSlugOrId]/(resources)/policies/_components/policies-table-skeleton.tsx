"use client";

import { Skeleton } from "@repo/ui/components/skeleton";

const ROW_COUNT = 3;

export function PoliciesTableSkeleton() {
  return (
    <div className="relative w-full overflow-hidden rounded-md border border-border bg-card">
      <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr] gap-4 border-b border-border px-4 py-3 font-mono typography-meta uppercase tracking-wider text-meta-foreground">
        <span>Name</span>
        <span>Type</span>
        <span>Targets</span>
        <span>Usage</span>
        <span>Updated</span>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: ROW_COUNT }).map((_, idx) => (
          <div
            key={idx}
            className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr] items-center gap-4 px-4 py-4"
          >
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-40 rounded-sm" />
              <Skeleton className="h-3 w-20 rounded-sm" />
            </div>
            <Skeleton className="h-3.5 w-16 rounded-sm" />
            <Skeleton className="h-3.5 w-32 rounded-sm" />
            <Skeleton className="h-3.5 w-12 rounded-sm" />
            <Skeleton className="h-3.5 w-16 rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
