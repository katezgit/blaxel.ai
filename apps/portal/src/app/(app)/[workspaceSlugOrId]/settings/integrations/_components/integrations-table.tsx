"use client";

import { type ReactNode } from "react";
import { flexRender, type Row, type Table } from "@tanstack/react-table";
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
  renderRowExtra?: (row: Row<TData>) => ReactNode;
}

// Local mirror of `(app)/_components/resource-table.tsx`. Two reasons for the
// fork: (1) integrations are a scan list — Alex reads 28 rows looking for one
// to configure — so the row hover uses the subtler `hover-surface-subtle` token
// rather than `hover-surface` from `tableRowVariants()`. (2) Rows can emit an
// inline warning band (`renderRowExtra`) rendered as a colSpanning `<tr>`
// immediately below the offending row, matching the operator's screenshot.
const rowClass = cn(
  "border-b border-border",
  "transition-[background-color] duration-fast ease-out-standard",
  "[tbody_&]:hover:bg-hover-surface-subtle",
);

export default function IntegrationsTable<TData>({
  table,
  renderRowExtra,
}: IntegrationsTableProps<TData>) {
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
          {table.getRowModel().rows.map((row) => {
            const extra = renderRowExtra?.(row);
            const visibleCells = row.getVisibleCells();
            return (
              <ExpandedRow
                key={row.id}
                row={row}
                extra={extra}
                colSpan={visibleCells.length}
              >
                {visibleCells.map((cell) => {
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
              </ExpandedRow>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface ExpandedRowProps<TData> {
  row: Row<TData>;
  extra: ReactNode;
  colSpan: number;
  children: ReactNode;
}

function ExpandedRow<TData>({
  row,
  extra,
  colSpan,
  children,
}: ExpandedRowProps<TData>) {
  if (!extra) {
    return <tr className={rowClass}>{children}</tr>;
  }
  // Warning band suppresses the row's bottom border so the band reads as the
  // continuation of the same logical row (single visual unit). The band keeps
  // its own bottom border to separate the unit from the next row.
  return (
    <>
      <tr className={cn(rowClass, "border-b-0")} data-row-id={row.id}>
        {children}
      </tr>
      <tr
        className="border-b border-border bg-state-warning-subtle"
        data-row-extra-for={row.id}
      >
        <td colSpan={colSpan} className="py-2 pl-6 pr-6">
          {extra}
        </td>
      </tr>
    </>
  );
}
