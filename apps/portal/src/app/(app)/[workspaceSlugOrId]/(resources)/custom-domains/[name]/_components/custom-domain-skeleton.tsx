import { Skeleton } from "@repo/ui/components/skeleton";
import { Breadcrumb } from "@/components/shell/breadcrumb";

interface CustomDomainSkeletonProps {
  workspaceSlug: string;
}

// Silhouette mirror of CustomDomainDetail: the same six bands the live page
// renders (DNS records / Verification / Certificate / Routing / CLI /
// Security) in the same flat `border-t pt-6` rhythm, each pre-shaped enough
// that the swap to populated content is layout-neutral. First band drops the
// top divider to match `Band`'s `first-of-type:border-t-0` rule.
export default function CustomDomainSkeleton({ workspaceSlug }: CustomDomainSkeletonProps) {
  const listHref = `/${workspaceSlug}/custom-domains`;
  return (
    <>
      <header className="flex flex-col gap-3">
        <Breadcrumb parent={{ href: listHref, label: "Custom domains" }} current="…" />
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <Skeleton className="h-7 w-72 max-w-full rounded-sm" />
            <Skeleton className="h-4 w-80 max-w-full rounded-sm" />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="h-9 w-36 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <Skeleton className="h-5 w-56 rounded-sm" />
        <Skeleton className="h-4 w-full max-w-xl rounded-sm" />
        <RecordGroupSkeleton groupWidth="w-12" records={1} />
        <RecordGroupSkeleton groupWidth="w-10" records={2} />
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-6">
        <Skeleton className="h-5 w-28 rounded-sm" />
        <DlSkeleton rows={["w-32", "w-20"]} />
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-6">
        <Skeleton className="h-5 w-24 rounded-sm" />
        <Skeleton className="h-4 w-56 rounded-sm" />
        <Skeleton className="h-4 w-full max-w-md rounded-sm" />
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-6">
        <Skeleton className="h-5 w-20 rounded-sm" />
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-36 rounded-sm" />
            <Skeleton className="h-4 w-44 rounded-sm" />
            <Skeleton className="h-4 w-64 rounded-sm" />
          </div>
          <Skeleton className="h-4 w-28 rounded-sm" />
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-6">
        <Skeleton className="h-5 w-10 rounded-sm" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-16 rounded-sm" />
          <Skeleton className="h-5 w-14 rounded-sm" />
          <Skeleton className="h-5 w-14 rounded-sm" />
        </div>
        <Skeleton className="h-16 w-full rounded-md" />
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-6">
        <Skeleton className="h-5 w-20 rounded-sm" />
        <DlSkeleton rows={["w-48", "w-56", "w-48", "w-56", "w-40"]} />
      </section>
    </>
  );
}

interface RecordGroupSkeletonProps {
  groupWidth: string;
  records: number;
}

function RecordGroupSkeleton({ groupWidth, records }: RecordGroupSkeletonProps) {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className={`h-4 ${groupWidth} rounded-sm`} />
      {Array.from({ length: records }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-20 rounded-sm" />
          <div className="grid grid-cols-[60px_1fr] gap-x-3 gap-y-1.5 items-baseline">
            <Skeleton className="h-3 w-8 rounded-sm" />
            <Skeleton className="h-4 w-72 max-w-full rounded-sm" />
            <Skeleton className="h-3 w-8 rounded-sm" />
            <Skeleton className="h-9 w-56 max-w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DlSkeleton({ rows }: { rows: ReadonlyArray<string> }) {
  return (
    <dl className="grid grid-cols-[140px_1fr] gap-x-6 gap-y-4 items-baseline">
      {rows.map((valueWidth, i) => (
        <div key={i} className="contents">
          <Skeleton className="h-4 w-24 rounded-sm" />
          <Skeleton className={`h-4 ${valueWidth} max-w-full rounded-sm`} />
        </div>
      ))}
    </dl>
  );
}
