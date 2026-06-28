import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@repo/ui/components/skeleton";

interface ServiceAccountDetailSkeletonProps {
  listHref: string;
}

export default function ServiceAccountDetailSkeleton({
  listHref,
}: ServiceAccountDetailSkeletonProps) {
  return (
    <>
      <header className="flex flex-col gap-3">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 typography-body text-muted-foreground"
        >
          <Link
            href={listHref}
            className="cursor-pointer rounded-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Service accounts
          </Link>
          <ChevronRight aria-hidden="true" className="size-3 text-meta-foreground" />
          <Skeleton className="h-4 w-40" />
        </nav>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="page-header min-w-0">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>
        </div>
      </header>
      <Skeleton className="h-4 w-80" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
    </>
  );
}
