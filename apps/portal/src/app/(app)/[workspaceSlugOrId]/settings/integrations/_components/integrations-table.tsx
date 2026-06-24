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

// Local mirror of `(app)/_components/resource-table.tsx`. One intentional
// difference from the canonical wrapper: the wrapper caps at
// `max-h-[calc(100vh-18rem)]` (matches the models-catalog precedent —
// same chrome shape: workspace topbar + page header + filter bar) so long
// lists scroll inside the container instead of pushing the page. The 18rem
// budget covers ~6rem topbar + ~6rem page header + ~3rem filter bar + ~3rem
// breathing room. `sticky top-0` on thead pins headers to *this* scroll
// container — it's the nearest scrolling ancestor.
//
// Catalog archetype (row-interaction.md §A): no row click — Connect/Manage button is the sole affordance.
//
// `bg-field-rest` repeats on the `<th>` cells (not just the `<thead>`) because
// HTML spec: `position: sticky` on a `<thead>` is a no-op — only the cells
// stick. When they stick alone with a transparent bg, scrolled rows bleed
// through the header text. The thead-level token + per-cell token together
// keep the strip opaque both at rest and while scrolling.
const rowClass = "border-b border-border";

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
