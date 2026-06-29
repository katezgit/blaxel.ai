"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/cn";

interface PolicyDetailSkeletonProps {
  // Omitted by route-level loading.tsx (no `params` access during segment
  // transition) — parent crumb renders as plain text in that pass. The
  // client view passes it during query-pending so the link stays live.
  workspaceSlug?: string;
}

// Silhouette mirror of PolicyDetailView: breadcrumb + heading row,
// then three editorial bands — Clause (first sibling, no top divider),
// Usage, Provenance (top divider suppressed; the live render drops the
// hairline here to keep the page calmer at the bottom).
export default function PolicyDetailSkeleton({
  workspaceSlug,
}: PolicyDetailSkeletonProps) {
  const listHref = workspaceSlug ? `/${workspaceSlug}/policies` : null;
  return (
    <>
      <header className="flex flex-col gap-3">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 typography-body text-muted-foreground"
        >
          {listHref ? (
            <Link
              href={listHref}
              className="cursor-pointer rounded-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Policies
            </Link>
          ) : (
            <span className="text-muted-foreground">Policies</span>
          )}
          <ChevronRight aria-hidden="true" className="size-3 text-meta-foreground" />
          <Skeleton className="h-4 w-32 rounded-sm" />
        </nav>
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

      <section className="flex flex-col gap-4">
        <BandHeadingSilhouette width="w-48" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-24 rounded-md" />
          <Skeleton className="h-7 w-28 rounded-md" />
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>
        <Skeleton className="h-3 w-full max-w-xl rounded-sm" />
      </section>

      {/* Usage band — workloads card, default top divider. */}
      <section className="flex flex-col gap-4 border-t border-border pt-6">
        <BandHeadingSilhouette width="w-16" />
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

      {/* Provenance band — top divider suppressed to match the live render. */}
      <section className="flex flex-col gap-4 pt-6">
        <BandHeadingSilhouette width="w-28" />
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-[140px_1fr]">
          {["w-32", "w-56", "w-56", "w-28", "w-44"].map((valueWidth, idx) => (
            <div key={idx} className="contents">
              <Skeleton className="h-5 w-24 rounded-sm" />
              <Skeleton className={cn("h-5 rounded-sm", valueWidth)} />
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}

// BandFrame renders the heading inside a flex row that reserves space for
// the hover-reveal Edit button (h-9). The skeleton mirrors that 36px row
// so the silhouette → live swap doesn't push content vertically.
function BandHeadingSilhouette({ width }: { width: string }) {
  return (
    <div className="flex h-9 items-center">
      <Skeleton className={cn("h-5 rounded-sm", width)} />
    </div>
  );
}
