import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@repo/ui/components/skeleton";

interface ServiceAccountDetailSkeletonProps {
  listHref: string;
}

export default function ServiceAccountDetailSkeleton({
  listHref,
}: ServiceAccountDetailSkeletonProps) {
  return (
    <>
      <nav>
        <Link
          href={listHref}
          className="inline-flex items-center gap-1 typography-body font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Service accounts
        </Link>
      </nav>
      <header className="page-header">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </header>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-72" />
        <Skeleton className="h-6 w-60" />
        <Skeleton className="h-6 w-40" />
      </div>
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
    </>
  );
}
