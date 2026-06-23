"use client";

import Link from "next/link";
import { Skeleton } from "@repo/ui/components/skeleton";

export function PolicyDetailSkeleton({ workspaceSlug }: { workspaceSlug: string }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-muted-foreground">
        <Link
          href={`/${workspaceSlug}/policies`}
          className="typography-label hover:text-foreground"
        >
          Policies
        </Link>
        <span aria-hidden="true" className="typography-label">/</span>
        <Skeleton className="h-3.5 w-32 rounded-sm" />
      </nav>

      <header className="flex flex-col gap-2">
        <Skeleton className="h-7 w-64 rounded-sm" />
        <Skeleton className="h-3 w-24 rounded-sm" />
        <div className="mt-2 flex gap-6">
          <Skeleton className="h-3.5 w-32 rounded-sm" />
          <Skeleton className="h-3.5 w-48 rounded-sm" />
        </div>
      </header>

      {Array.from({ length: 4 }).map((_, idx) => (
        <section
          key={idx}
          className="flex flex-col gap-3 border-t border-border pt-6"
        >
          <Skeleton className="h-3 w-20 rounded-sm" />
          <Skeleton className="h-3.5 w-full max-w-2xl rounded-sm" />
          <Skeleton className="h-3.5 w-full max-w-xl rounded-sm" />
          <div className="grid grid-cols-1 gap-2">
            {Array.from({ length: 3 }).map((__, jdx) => (
              <Skeleton key={jdx} className="h-9 w-full rounded-md" />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
