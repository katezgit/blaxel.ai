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

export default function SandboxDetailSkeleton({
  workspaceSlug,
}: SandboxDetailSkeletonProps) {
  const listHref = workspaceSlug ? `/${workspaceSlug}/sandboxes` : null;
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
        <div className="flex flex-col items-start gap-2">
          <Skeleton className="h-7 w-56 rounded-sm" />
          <Skeleton className="h-4 w-[24rem] max-w-full rounded-sm" />
        </div>
      </header>

      <section className="flex flex-col gap-4 pt-6">
        <BandHeadingSilhouette width="w-32" />
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-[160px_1fr]">
          {["w-40", "w-24", "w-32", "w-44", "w-16", "w-28"].map(
            (valueWidth, idx) => (
              <div key={idx} className="contents">
                <Skeleton className="h-5 w-28 rounded-sm" />
                <Skeleton className={cn("h-5 rounded-sm", valueWidth)} />
              </div>
            ),
          )}
        </dl>
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-6">
        <BandHeadingSilhouette width="w-28" />
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-[160px_1fr]">
          {["w-40", "w-44", "w-32", "w-56"].map((valueWidth, idx) => (
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

function BandHeadingSilhouette({ width }: { width: string }) {
  return (
    <div className="flex h-9 items-center">
      <Skeleton className={cn("h-5 rounded-sm", width)} />
    </div>
  );
}
