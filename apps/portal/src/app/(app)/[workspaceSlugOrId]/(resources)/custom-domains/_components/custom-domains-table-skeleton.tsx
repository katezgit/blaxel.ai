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
                <SkeletonBar className="w-44" />
              </td>
              <td className={tableCellVariants()}>
                <SkeletonBar className="w-20" />
              </td>
              <td className={tableCellVariants()}>
                <SkeletonBar className="w-16" />
              </td>
              <td className={tableCellVariants()}>
                <SkeletonBar className="w-14" />
              </td>
              <td className={cn(tableCellVariants(), "w-10")} aria-hidden="true" />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SkeletonBar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block h-3 animate-pulse rounded-sm bg-muted-surface",
        className,
      )}
    />
  );
}
