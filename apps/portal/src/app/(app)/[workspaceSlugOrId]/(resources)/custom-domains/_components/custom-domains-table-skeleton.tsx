import { Skeleton } from "@repo/ui/components/skeleton";
import {
  tableBodyClass,
  tableCellVariants,
  tableClass,
  tableHeaderClass,
  tableHeadVariants,
  tableRowVariants,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/cn";

const ROWS = 3;

// Silhouette mirror of CustomDomainsTable: each cell echoes the shape of the
// populated render (Domain cell stacks name + display name + label chips;
// Region cell pairs a flag-glyph dot with city + mono slug; Status is a pill;
// Last verified is a tight relative-time bar) so the swap-in is layout-neutral.
export function CustomDomainsTableSkeleton() {
  return (
    <div className="relative w-full overflow-hidden overflow-x-auto rounded-md border border-border bg-card">
      <table className={tableClass}>
        <thead className={tableHeaderClass}>
          <tr>
            <th className={tableHeadVariants()}>Domain</th>
            <th className={tableHeadVariants()}>Region</th>
            <th className={tableHeadVariants()}>Status</th>
            <th className={tableHeadVariants()}>Last verified</th>
            <th className={cn(tableHeadVariants(), "w-10")} aria-hidden="true" />
          </tr>
        </thead>
        <tbody className={tableBodyClass}>
          {Array.from({ length: ROWS }).map((_, i) => (
            <tr key={i} className={tableRowVariants()}>
              <td className={tableCellVariants()}>
                <DomainCellSkeleton />
              </td>
              <td className={tableCellVariants()}>
                <RegionCellSkeleton />
              </td>
              <td className={tableCellVariants()}>
                <Skeleton className="h-5 w-16 rounded-full" />
              </td>
              <td className={tableCellVariants()}>
                <Skeleton className="h-3 w-12 rounded-sm" />
              </td>
              <td className={cn(tableCellVariants(), "w-10")} aria-hidden="true">
                <Skeleton className="ml-auto size-4 rounded-sm" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DomainCellSkeleton() {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-3.5 w-44 rounded-sm" />
      <Skeleton className="h-2.5 w-28 rounded-sm" />
      <div className="mt-1 flex gap-1">
        <Skeleton className="h-3.5 w-14 rounded-sm" />
        <Skeleton className="h-3.5 w-20 rounded-sm" />
      </div>
    </div>
  );
}

function RegionCellSkeleton() {
  return (
    <div className="inline-flex items-center gap-1.5">
      <Skeleton className="size-4 rounded-full" />
      <Skeleton className="h-3 w-20 rounded-sm" />
      <Skeleton className="h-3 w-16 rounded-sm" />
    </div>
  );
}
