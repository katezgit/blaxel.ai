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
  getRowClassName?: (row: Row<TData>) => string | undefined;
}

// Local mirror of `(app)/_components/resource-table.tsx`. Three reasons for the
// fork: (1) integrations are a scan list — Alex reads 28 rows looking for one
// to configure — so the row hover uses the subtler `hover-surface-subtle` token
// rather than `hover-surface` from `tableRowVariants()`. (2) Rows can emit an
// inline warning band (`renderRowExtra`) rendered as a colSpanning `<tr>`
// immediately below the offending row, matching the operator's screenshot.
// (3) Per-row className hook lets rows with `statusWarning` carry the same
// `bg-state-warning-subtle + inset-shadow accent` treatment used by the
// Open-invoice row, the team expired-invite row, and the api-keys near-expiry
// row — the accent sits INSIDE the container border so the row's 2px guide
// does not compete with the wrapper's 1px outline.
const rowClass = cn(
  "border-b border-border",
  "transition-[background-color] duration-fast ease-out-standard",
  "[tbody_&]:hover:bg-hover-surface-subtle",
);

// Height model: the wrapper shrinks to content when the list is short, and
// caps at `max-h-[calc(100vh-18rem)]` (matches the models-catalog precedent —
// same chrome shape: workspace topbar + page header + filter bar) so long
// lists scroll inside the container instead of pushing the page. The 18rem
// budget covers ~6rem topbar + ~6rem page header + ~3rem filter bar + ~3rem
// breathing room. `sticky top-0` on thead pins headers to the top of *this*
// scroll container — it's the nearest scrolling ancestor.
//
// `bg-field-rest` repeats on the `<th>` cells (not just the `<thead>`) because
// HTML spec: `position: sticky` on a `<thead>` is a no-op — only the cells
// stick. When they stick alone with a transparent bg, scrolled rows bleed
// through the header text. The thead-level token + per-cell token together
// keep the strip opaque both at rest and while scrolling.
export default function IntegrationsTable<TData>({
  table,
  renderRowExtra,
  getRowClassName,
}: IntegrationsTableProps<TData>) {
  return (
    <div className="relative w-full max-h-[calc(100vh-18rem)] overflow-x-auto overflow-y-auto rounded-md border border-border bg-card">
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
            const extraClass = getRowClassName?.(row);
            return (
              <ExpandedRow
                key={row.id}
                row={row}
                extra={extra}
                extraClass={extraClass}
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
  extraClass: string | undefined;
  colSpan: number;
  children: ReactNode;
}

function ExpandedRow<TData>({
  row,
  extra,
  extraClass,
  colSpan,
  children,
}: ExpandedRowProps<TData>) {
  if (!extra) {
    return <tr className={cn(rowClass, extraClass)}>{children}</tr>;
  }
  // Warning band suppresses the row's bottom border so the band reads as the
  // continuation of the same logical row (single visual unit). The band keeps
  // its own bottom border to separate the unit from the next row. When the
  // parent row carries the warning treatment, the band inherits the same
  // inset-shadow accent so the two `<tr>`s read as one warning unit (matches
  // the inset treatment used on the parent row — see header comment).
  return (
    <>
      <tr className={cn(rowClass, "border-b-0", extraClass)} data-row-id={row.id}>
        {children}
      </tr>
      <tr
        className={cn(
          "border-b border-border bg-state-warning-subtle",
          // eslint-disable-next-line no-restricted-syntax -- inset accent matches the parent row treatment; no @theme utility expresses inset-shadow position+width for a color token
          extraClass && "shadow-[inset_2px_0_0_var(--color-state-warning)]",
        )}
        data-row-extra-for={row.id}
      >
        <td colSpan={colSpan} className="py-2 pl-6 pr-6">
          {extra}
        </td>
      </tr>
    </>
  );
}
