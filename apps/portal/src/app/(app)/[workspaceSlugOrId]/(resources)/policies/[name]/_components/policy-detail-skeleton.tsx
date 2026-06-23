"use client";

import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/cn";
import { Breadcrumb } from "@/components/shell/breadcrumb";

// Silhouette mirror of the live PolicyDetailView: heading row without an
// avatar (the surface dropped it), action cluster on the right, then four
// editorial bands (Clause / Usage / Provenance / CLI) each with a real
// section heading + content shape that resembles the populated render so
// the swap-in is layout-neutral.
export default function PolicyDetailSkeleton({ workspaceSlug }: { workspaceSlug: string }) {
  const listHref = `/${workspaceSlug}/policies`;
  return (
    <>
      <header className="flex flex-col gap-3">
        <Breadcrumb parent={{ href: listHref, label: "Policies" }} current="…" />
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <Skeleton className="h-7 w-56 rounded-sm" />
            <Skeleton className="h-4 w-[28rem] max-w-full rounded-sm" />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="h-9 w-28 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      </header>

      {/* Clause band */}
      <section className="flex flex-col gap-4 border-t border-border pt-6">
        <Skeleton className="h-5 w-20 rounded-sm" />
        <Skeleton className="h-4 w-full max-w-2xl rounded-sm" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-32 rounded-sm" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-44 rounded-md" />
            <Skeleton className="h-7 w-40 rounded-md" />
            <Skeleton className="h-7 w-36 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-3 w-full max-w-xl rounded-sm" />
      </section>

      {/* Usage band — workloads card */}
      <section className="flex flex-col gap-4 pt-6">
        <Skeleton className="h-5 w-16 rounded-sm" />
        <div className="flex flex-col rounded-md border border-border">
          <div className="border-b border-border px-4 py-3">
            <Skeleton className="h-4 w-56 rounded-sm" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <Skeleton className="h-4 w-24 rounded-sm" />
                <Skeleton className="h-4 w-6 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Provenance band — Type / Created / Last updated / Workspace / Labels */}
      <section className="flex flex-col gap-4 border-t border-border pt-6">
        <Skeleton className="h-5 w-28 rounded-sm" />
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-[140px_1fr]">
          {[
            "w-32",
            "w-56",
            "w-56",
            "w-28",
            "w-44",
          ].map((valueWidth, idx) => (
            <div key={idx} className="contents">
              <Skeleton className="h-4 w-24 rounded-sm" />
              <Skeleton className={cn("h-4 rounded-sm", valueWidth)} />
            </div>
          ))}
        </dl>
      </section>

      {/* CLI band — tabs + code block */}
      <section className="flex flex-col gap-4 border-t border-border pt-6">
        <Skeleton className="h-5 w-10 rounded-sm" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-14 rounded-sm" />
          <Skeleton className="h-5 w-14 rounded-sm" />
          <Skeleton className="h-5 w-16 rounded-sm" />
        </div>
        <Skeleton className="h-40 w-full rounded-md" />
      </section>
    </>
  );
}
