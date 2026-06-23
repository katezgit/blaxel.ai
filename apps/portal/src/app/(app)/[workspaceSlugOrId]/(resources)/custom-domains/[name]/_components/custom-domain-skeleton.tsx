import { cn } from "@repo/ui/lib/cn";
import { Breadcrumb } from "@/components/shell/breadcrumb";

interface CustomDomainSkeletonProps {
  workspaceSlug: string;
}

export function CustomDomainSkeleton({ workspaceSlug }: CustomDomainSkeletonProps) {
  const listHref = `/${workspaceSlug}/custom-domains`;
  return (
    <>
      <header className="flex flex-col gap-3">
        <Breadcrumb parent={{ href: listHref, label: "Custom domains" }} current="—" />
        <div className="flex items-start gap-3">
          <SkeletonBar className="size-10 rounded-full" />
          <div className="page-header min-w-0">
            <SkeletonBar className="h-7 w-72" />
            <SkeletonBar className="h-4 w-96" />
          </div>
        </div>
      </header>

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
