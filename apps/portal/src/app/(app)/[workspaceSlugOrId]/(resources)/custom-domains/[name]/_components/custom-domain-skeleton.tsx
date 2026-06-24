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
import { Breadcrumb } from "@/components/shell/breadcrumb";

interface CustomDomainSkeletonProps {
  workspaceSlug: string;
}

// Silhouette mirror of CustomDomainDetail: the four bands the live page can
// render (DNS records / Certificate / Routing / Audit) in the same flat
// `border-t pt-6` rhythm Band uses, each pre-shaped so the swap to populated
// content is layout-neutral. The first band drops the top divider to match
// Band's `first-of-type:{pt-0,border-t-0}` rule. Certificate is rendered
// even though the live page hides it on `pending` — the skeleton can't yet
// know the status, and overstating one band on swap reads cleaner than
// understating the verified silhouette.
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

      {/* DNS records to publish at your provider */}
      <section className="flex flex-col gap-4">
        <Skeleton className="h-5 w-72 max-w-full rounded-sm" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3.5 w-64 max-w-full rounded-sm" />
          <DnsRecordsTableSkeleton rows={3} />
        </div>
      </section>

      {/* Certificate */}
      <section className="flex flex-col gap-4 border-t border-border pt-6">
        <Skeleton className="h-5 w-24 rounded-sm" />
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-56 rounded-sm" />
            <ul className="flex flex-col gap-1.5">
              <li>
                <Skeleton className="h-8 w-72 max-w-full rounded-md" />
              </li>
              <li>
                <Skeleton className="h-8 w-80 max-w-full rounded-md" />
              </li>
            </ul>
          </div>
          <Skeleton className="h-4 w-80 max-w-full rounded-sm" />
        </div>
      </section>

      {/* Routing */}
      <section className="flex flex-col gap-4 border-t border-border pt-6">
        <Skeleton className="h-5 w-20 rounded-sm" />
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-32 rounded-sm" />
            <Skeleton className="h-4 w-48 rounded-sm" />
            <Skeleton className="h-4 w-64 rounded-sm" />
          </div>
          <Skeleton className="h-4 w-24 rounded-sm" />
        </div>
      </section>

      {/* Audit */}
      <section className="flex flex-col gap-4 border-t border-border pt-6">
        <Skeleton className="h-5 w-12 rounded-sm" />
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-4 items-baseline">
          <Skeleton className="h-4 w-20 rounded-sm" />
          <Skeleton className="h-4 w-32 max-w-full rounded-sm" />
          <Skeleton className="h-4 w-20 rounded-sm" />
          <Skeleton className="h-4 w-56 max-w-full rounded-sm" />
          <Skeleton className="h-4 w-28 rounded-sm" />
          <Skeleton className="h-4 w-32 max-w-full rounded-sm" />
          <Skeleton className="h-4 w-28 rounded-sm" />
          <Skeleton className="h-4 w-56 max-w-full rounded-sm" />
          <Skeleton className="h-4 w-12 rounded-sm" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-5 w-24 rounded-sm" />
            <Skeleton className="h-5 w-20 rounded-sm" />
            <Skeleton className="h-5 w-28 rounded-sm" />
          </div>
        </dl>
      </section>
    </>
  );
}

// Mirrors the live DNS records table chrome (same border/card wrapper,
// same column widths, same head/cell classes) so the body rows reflow
// into populated rows at the identical pixel grid.
function DnsRecordsTableSkeleton({ rows }: { rows: number }) {
  return (
    <div className="relative w-full overflow-hidden overflow-x-auto rounded-md border border-border bg-card">
      <table className={tableClass} aria-hidden="true">
        <thead className={tableHeaderClass}>
          <tr>
            <th className={cn(tableHeadVariants(), "w-[80px]")}>
              <Skeleton className="h-3 w-10 rounded-sm" />
            </th>
            <th className={tableHeadVariants()}>
              <Skeleton className="h-3 w-10 rounded-sm" />
            </th>
            <th className={tableHeadVariants()}>
              <Skeleton className="h-3 w-12 rounded-sm" />
            </th>
            <th className={cn(tableHeadVariants(), "w-[140px]")}>
              <Skeleton className="h-3 w-12 rounded-sm" />
            </th>
          </tr>
        </thead>
        <tbody className={tableBodyClass}>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className={tableRowVariants()}>
              <td className={tableCellVariants()}>
                <Skeleton className="h-4 w-12 rounded-sm" />
              </td>
              <td className={tableCellVariants()}>
                <Skeleton className="h-4 w-40 max-w-full rounded-sm" />
              </td>
              <td className={tableCellVariants()}>
                <Skeleton className="h-4 w-64 max-w-full rounded-sm" />
              </td>
              <td className={tableCellVariants()}>
                <Skeleton className="h-4 w-20 rounded-sm" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
