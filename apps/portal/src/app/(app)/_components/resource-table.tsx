"use client";

import { flexRender, type Row, type Table } from "@tanstack/react-table";
import {
  tableBodyClass,
  tableCellVariants,
  tableClass,
  tableHeaderClass,
  tableHeadVariants,
  tableRowVariants,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/cn";

interface ResourceTableProps<TData> {
  table: Table<TData>;
  // Per-row className hook — used by surfaces that highlight rows on a domain
  // state (api-keys near-expiry, team expired invite). Sibling to the
  // Open-invoice highlight pattern on billing/invoices-payment.
  getRowClassName?: (row: Row<TData>) => string | undefined;
}

/**
 * Workspace-area table chrome — sibling to `(manage)/_components/manage-table`.
 * Identical structural primitive but kept separate so manage and app surfaces
 * can diverge on chrome (selection bars, density, etc.) without forking a
 * shared component back.
 */
export function ResourceTable<TData>({
  table,
  getRowClassName,
}: ResourceTableProps<TData>) {
  return (
    <div className="relative w-full overflow-hidden overflow-x-auto rounded-md border border-border bg-card">
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
                    className={cn(tableHeadVariants(), meta?.headerClassName)}
                  >
                    {!header.isPlaceholder &&
                      flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className={tableBodyClass}>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={cn(tableRowVariants(), getRowClassName?.(row))}
            >
              {row.getVisibleCells().map((cell) => {
                const meta = cell.column.columnDef.meta as
                  | { cellClassName?: string }
                  | undefined;
                return (
                  <td key={cell.id} className={cn(tableCellVariants(), meta?.cellClassName)}>
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
