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
  // When set, the outer container becomes the scrolling ancestor (capped at
  // this height) instead of letting the page scroll. `tableHeadVariants` is
  // already `sticky top-0` — that pins to this container automatically.
  // Each <th> also gains `bg-muted-surface` because position:sticky lifts the
  // cells out of <thead>'s painted box; without an opaque per-cell bg,
  // scrolled rows bleed through the pinned header strip.
  maxHeight?: string;
  // Whole-row click target — Archetype B (Resource row) surfaces. Suppressed
  // when the click originates inside an interactive child (`<a>`, `<button>`,
  // `[role="menuitem"]`) so per-cell affordances (kebab, copy) still work.
  onRowClick?: (row: Row<TData>) => void;
  // Paired with onRowClick — used to prefetch the destination route on
  // pointer entry (Next.js router.prefetch).
  onRowMouseEnter?: (row: Row<TData>) => void;
}

/**
 * Workspace-area table chrome — sibling to `(manage)/_components/manage-table`.
 * Identical structural primitive but kept separate so manage and app surfaces
 * can diverge on chrome (selection bars, density, etc.) without forking a
 * shared component back.
 *
 * MOTION (B7 — keep-instant): rows render without --animate-row-reveal by
 * design. These are dense operational tables (Sandboxes, API Keys, Policies,
 * Agents, Jobs); row insertion animation in a fast-updating list hides the
 * change — the slide-up completes while the user is reading the previous row.
 * --animate-row-reveal is reserved for sparse arrival-ordered contexts (e.g.
 * a Job event timeline). See docs/design/foundations/motion-application.md §B7.
 */
export function ResourceTable<TData>({
  table,
  getRowClassName,
  maxHeight,
  onRowClick,
  onRowMouseEnter,
}: ResourceTableProps<TData>) {
  const isStickyScroll = maxHeight !== undefined;
  return (
    <div
      className={cn(
        // overflow-x-auto preserves horizontal scroll on narrow viewports;
        // avoid the `overflow-hidden` shorthand here — it would silently override
        // overflow-x and clip rows with no scroll affordance.
        "relative w-full overflow-x-auto rounded-md border border-border bg-card",
        isStickyScroll && "overflow-y-auto",
      )}
      style={isStickyScroll ? { maxHeight } : undefined}
    >
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
                      isStickyScroll && "bg-muted-surface",
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
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={cn(
                tableRowVariants(),
                onRowClick && "cursor-pointer",
                getRowClassName?.(row),
              )}
              onClick={
                onRowClick
                  ? (event) => {
                      // Suppress whole-row navigation when the click originated
                      // on an interactive child (kebab, link, copy button) so
                      // those affordances stay clickable inside a navigable row.
                      const target = event.target as HTMLElement;
                      if (
                        target.closest(
                          "a, button, [role='menuitem'], [role='menu']",
                        )
                      ) {
                        return;
                      }
                      onRowClick(row);
                    }
                  : undefined
              }
              onMouseEnter={
                onRowMouseEnter ? () => onRowMouseEnter(row) : undefined
              }
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
