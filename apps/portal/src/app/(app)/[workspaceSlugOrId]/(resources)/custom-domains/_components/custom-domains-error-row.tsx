import {
  tableBodyClass,
  tableCellVariants,
  tableClass,
  tableHeaderClass,
  tableHeadVariants,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/cn";

export function CustomDomainsErrorRow() {
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
          <tr>
            <td
              colSpan={5}
              className={cn(tableCellVariants(), "py-8 text-center typography-body text-state-errored-text")}
            >
              Custom domains unavailable — refresh to retry.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
