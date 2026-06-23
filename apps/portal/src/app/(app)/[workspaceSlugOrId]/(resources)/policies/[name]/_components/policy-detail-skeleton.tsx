"use client";

import { Skeleton } from "@repo/ui/components/skeleton";
import { Breadcrumb } from "@/components/shell/breadcrumb";

export function PolicyDetailSkeleton({ workspaceSlug }: { workspaceSlug: string }) {
  const listHref = `/${workspaceSlug}/policies`;
  return (
    <>
      <header className="flex flex-col gap-3">
        <Breadcrumb
          parent={{ href: listHref, label: "Policies" }}
          current="—"
        />
        <div className="flex items-start gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="page-header min-w-0">
            <Skeleton className="h-7 w-64 rounded-sm" />
            <Skeleton className="h-4 w-48 rounded-sm" />
          </div>
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
