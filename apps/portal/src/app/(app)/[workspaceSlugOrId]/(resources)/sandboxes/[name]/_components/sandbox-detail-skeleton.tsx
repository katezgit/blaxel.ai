"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/cn";

interface SandboxDetailSkeletonProps {
  // Omitted by route-level loading.tsx (no `params` access during segment
  // transition) — parent crumb renders as plain text. The client view passes
  // it during query-pending so the link stays live.
  workspaceSlug?: string;
}

/** Loading skeleton per wireframe §2.7. Mirrors the populated header
 * rhythm: outer `<header>` carries `gap-3 pt-2 pb-6`; title column uses
 * `.page-header`; meta row shows 4–6 inline blocks separated by `·`.
 * Tier-1 bands (provenance, connect-now, vitals) render shape-preserving
 * skeletons so the page does not jump on load. */
export default function SandboxDetailSkeleton({
  workspaceSlug,
}: SandboxDetailSkeletonProps) {
  const listHref = workspaceSlug ? `/${workspaceSlug}/sandboxes` : null;
  return (
    <>
      <header className="flex flex-col gap-3 pt-2 pb-6">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 typography-body text-muted-foreground"
        >
          {listHref ? (
            <Link
              href={listHref}
              className="cursor-pointer rounded-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sandboxes
            </Link>
          ) : (
            <span className="text-muted-foreground">Sandboxes</span>
          )}
          <ChevronRight
            aria-hidden="true"
            className="size-3 text-meta-foreground"
          />
          <Skeleton className="h-4 w-32 rounded-sm" />
        </nav>
        <div className="flex min-w-0 flex-col page-header">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-40 rounded-sm" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="page-header-meta">
            {["w-24", "w-44", "w-20", "w-24", "w-32", "w-28"].map(
              (width, idx) => (
                <Skeleton
                  key={idx}
                  className={cn("h-4 rounded-sm", width)}
                />
              ),
            )}
          </div>
        </div>
      </header>

      <section
        aria-label="Spawned by"
        className="flex items-center gap-3 border-t border-border pt-6"
      >
        <Skeleton className="h-4 w-24 rounded-sm" />
        <Skeleton className="h-4 w-56 rounded-sm" />
      </section>

      <section
        aria-label="Connect now"
        className="flex flex-col gap-2 border-t border-border pt-6"
      >
        <Skeleton className="h-4 w-28 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-md" />
      </section>

      <section
        aria-label="Vitals"
        className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-6 sm:grid-cols-4"
      >
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-16 rounded-sm" />
            <Skeleton className="h-6 w-20 rounded-sm" />
            <Skeleton className="h-4 w-24 rounded-sm" />
          </div>
        ))}
      </section>
    </>
  );
}
