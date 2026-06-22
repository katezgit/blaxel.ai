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

interface TeamTableProps<TData> {
  table: Table<TData>;
  getRowClassName?: (row: Row<TData>) => string | undefined;
}

// Local mirror of `(app)/_components/resource-table.tsx` with a per-row className
// hook so expired invitations can carry the warning row treatment in step with
// the Open-invoice highlight on /account/billing/invoices-payment.
export default function TeamTable<TData>({
  table,
  getRowClassName,
}: TeamTableProps<TData>) {
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
