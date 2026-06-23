import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import { Breadcrumb } from "@/components/shell/breadcrumb";

interface CustomDomainSkeletonProps {
  workspaceSlug: string;
}

export function CustomDomainSkeleton({ workspaceSlug }: CustomDomainSkeletonProps) {
  const listHref = `/${workspaceSlug}/custom-domains`;
  return (
    <>
      <div className="flex flex-col gap-3">
        <Breadcrumb parent={{ href: listHref, label: "Custom domains" }} current="—" />
        <Link
          href={listHref}
          className="inline-flex items-center gap-1 self-start typography-label text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Custom domains
        </Link>
        <div className="flex flex-col gap-2">
          <SkeletonBar className="h-7 w-72" />
          <SkeletonBar className="h-4 w-96" />
        </div>
      </div>

      {Array.from({ length: 4 }).map((_, i) => (
        <BandSkeleton key={i} />
      ))}
    </>
  );
}

function BandSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-6">
      <SkeletonBar className="h-3 w-24" />
      <SkeletonBar className="h-4 w-64" />
      <SkeletonBar className="h-4 w-80" />
    </div>
  );
}

function SkeletonBar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("block animate-pulse rounded-sm bg-muted-surface", className)}
    />
  );
}
