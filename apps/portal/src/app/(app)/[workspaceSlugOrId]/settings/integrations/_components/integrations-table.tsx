"use client";

import { flexRender, type Table } from "@tanstack/react-table";
import {
  tableBodyClass,
  tableCellVariants,
  tableClass,
  tableHeaderClass,
  tableHeadVariants,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/cn";

interface IntegrationsTableProps<TData> {
  table: Table<TData>;
}

// Local mirror of `(app)/_components/resource-table.tsx`. Two intentional
// differences from the canonical wrapper: (1) the integrations catalog is a
// scan list — Alex reads 28 rows looking for one to configure — so the row
// hover uses the subtler `hover-surface-subtle` token. (2) The wrapper caps
// at `max-h-[calc(100vh-18rem)]` (matches the models-catalog precedent —
// same chrome shape: workspace topbar + page header + filter bar) so long
// lists scroll inside the container instead of pushing the page. The 18rem
// budget covers ~6rem topbar + ~6rem page header + ~3rem filter bar + ~3rem
// breathing room. `sticky top-0` on thead pins headers to *this* scroll
// container — it's the nearest scrolling ancestor.
//
// `bg-field-rest` repeats on the `<th>` cells (not just the `<thead>`) because
// HTML spec: `position: sticky` on a `<thead>` is a no-op — only the cells
// stick. When they stick alone with a transparent bg, scrolled rows bleed
// through the header text. The thead-level token + per-cell token together
// keep the strip opaque both at rest and while scrolling.
const rowClass = cn(
  "border-b border-border",
  "transition-[background-color] duration-fast ease-out-standard",
  "[tbody_&]:hover:bg-hover-surface-subtle",
);

export default function IntegrationsTable<TData>({
  table,
}: IntegrationsTableProps<TData>) {
  return (
    <div className="relative max-h-[calc(100vh-18rem)] w-full overflow-x-auto overflow-y-auto rounded-md border border-border bg-card">
      <table className={tableClass}>
        <thead className={tableHeaderClass}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta as
                  | { headerClassName?: string }
                  | undefined;
                return (
                  <th
                    key={header.id}
                    className={cn(
                      tableHeadVariants(),
                      "bg-field-rest",
                      meta?.headerClassName,
                    )}
                  >
                    {!header.isPlaceholder &&
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className={tableBodyClass}>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className={rowClass}>
              {row.getVisibleCells().map((cell) => {
                const meta = cell.column.columnDef.meta as
                  | { cellClassName?: string }
                  | undefined;
                return (
                  <td
                    key={cell.id}
                    className={cn(tableCellVariants(), meta?.cellClassName)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
