import { Skeleton } from "@repo/ui/components/skeleton";
import { Card, CardContent } from "@repo/ui/components/card";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <AccessSectionSkeleton />
      <ProvenanceStripSkeleton />
      <StatCardsRowSkeleton />
      <ChartSectionSkeleton label="Sandbox calls" trailingWidth="w-40" />
      <ChartSectionSkeleton label="RAM usage" trailingWidth="w-56" />
      <ListSectionSkeleton label="Events" rows={3} trailingWidth="w-20" />
      <ListSectionSkeleton label="Schedules" rows={2} trailingWidth="w-36" />
    </div>
  );
}

function AccessSectionSkeleton() {
  return (
    <section aria-label="Quick access" className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-28 rounded-sm" />
        <div className="flex items-center gap-4">
          {["w-16", "w-20", "w-24", "w-24"].map((w, i) => (
            <Skeleton key={i} className={`h-5 rounded-sm ${w}`} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-md border border-border bg-page px-3 py-2">
          <Skeleton className="h-4 flex-1 rounded-sm" />
          <Skeleton className="size-6 shrink-0 rounded-sm" />
        </div>
        <Skeleton className="h-3 w-2/3 rounded-sm" />
      </div>
    </section>
  );
}

function ProvenanceStripSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-3 w-32 rounded-sm" />
      <Skeleton className="h-3 w-3 rounded-sm" />
      <Skeleton className="h-3 w-36 rounded-sm" />
    </div>
  );
}

function StatCardsRowSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <RequestsCardSkeleton />
        <SparklineCardSkeleton label="Sandbox calls" />
        <SparklineCardSkeleton label="Errors" />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <UsageCardSkeleton label="RAM usage max" />
        <UsageCardSkeleton label="CPU usage max" />
      </div>
    </div>
  );
}

function RequestsCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-3 w-16 rounded-sm" />
          <Skeleton className="h-5 w-10 rounded-sm" />
          <Skeleton className="h-3 w-12 rounded-sm" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <Skeleton className="h-5 w-8 rounded-sm" />
              <Skeleton className="h-3 w-8 rounded-sm" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-16 rounded-sm" />
          <Skeleton className="h-3 w-10 rounded-sm" />
        </div>
      </CardContent>
    </Card>
  );
}

function SparklineCardSkeleton({ label }: { label: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-3 w-24 rounded-sm" aria-label={label} />
          <Skeleton className="h-5 w-10 rounded-sm" />
          <Skeleton className="h-3 w-12 rounded-sm" />
        </div>
        <Skeleton className="h-9 w-full rounded-sm" />
      </CardContent>
    </Card>
  );
}

function UsageCardSkeleton({ label }: { label: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-3 w-28 rounded-sm" aria-label={label} />
          <Skeleton className="h-5 w-10 rounded-sm" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-20 rounded-sm" />
          <Skeleton className="h-3 w-3 rounded-sm" />
          <Skeleton className="h-3 w-24 rounded-sm" />
        </div>
        <Skeleton className="h-14 w-full rounded-sm" />
      </CardContent>
    </Card>
  );
}

function ChartSectionSkeleton({
  label,
  trailingWidth,
}: {
  label: string;
  trailingWidth: string;
}) {
  return (
    <section aria-label={label} className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-32 rounded-sm" />
        <Skeleton className={`h-3 rounded-sm ${trailingWidth}`} />
      </div>
      <div className="rounded-md border border-border bg-page p-3">
        <Skeleton className="h-32 w-full rounded-sm" />
      </div>
    </section>
  );
}

function ListSectionSkeleton({
  label,
  rows,
  trailingWidth,
}: {
  label: string;
  rows: number;
  trailingWidth: string;
}) {
  return (
    <section aria-label={label} className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-24 rounded-sm" />
        <Skeleton className={`h-4 rounded-sm ${trailingWidth}`} />
      </div>
      <div className="flex flex-col divide-y divide-border rounded-md border border-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-2"
          >
            <Skeleton className="h-4 w-16 rounded-sm" />
            <Skeleton className="h-4 w-20 rounded-sm" />
            <Skeleton className="h-4 flex-1 rounded-sm" />
          </div>
        ))}
      </div>
    </section>
  );
}
