"use client";

// Pagination footer for the Sandboxes list — always visible so layout stays
// stable even at 1 page. Per sandboxes-list-2026-07-01 wireframe §1.4:
//   Rows per page [10 ▾]    Page 1 of N    |◀  ◀  ▶  ▶|
//
// Client-side: current sandbox count (~80) fits every rows-per-page bucket.
// Server-side pagination is a follow-up when the API paginates at 30k+ rows;
// this component's props are shaped to translate directly to that signature.

import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { IconButton } from "@repo/ui/components/icon-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

interface SandboxesPaginationProps {
  pageIndex: number;
  pageSize: PageSize;
  totalRows: number;
  onPageIndexChange: (next: number) => void;
  onPageSizeChange: (next: PageSize) => void;
}

export function SandboxesPagination({
  pageIndex,
  pageSize,
  totalRows,
  onPageIndexChange,
  onPageSizeChange,
}: SandboxesPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = Math.min(pageIndex + 1, totalPages);
  const isFirstPage = pageIndex === 0;
  const isLastPage = pageIndex >= totalPages - 1;

  return (
    <div className="flex flex-wrap items-center justify-end gap-6 py-2 typography-meta text-muted-foreground">
      <div className="flex items-center gap-2">
        <span>Rows per page</span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => {
            onPageSizeChange(Number(value) as PageSize);
            onPageIndexChange(0);
          }}
        >
          <SelectTrigger className="h-8 w-[74px]" aria-label="Rows per page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="tabular-nums">
        Page {currentPage.toLocaleString("en-US")} of{" "}
        {totalPages.toLocaleString("en-US")}
      </div>
      <div className="flex items-center gap-1">
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="First page"
          disabled={isFirstPage}
          onClick={() => onPageIndexChange(0)}
        >
          <ChevronsLeft aria-hidden="true" />
        </IconButton>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Previous page"
          disabled={isFirstPage}
          onClick={() => onPageIndexChange(Math.max(0, pageIndex - 1))}
        >
          <ChevronLeft aria-hidden="true" />
        </IconButton>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Next page"
          disabled={isLastPage}
          onClick={() =>
            onPageIndexChange(Math.min(totalPages - 1, pageIndex + 1))
          }
        >
          <ChevronRight aria-hidden="true" />
        </IconButton>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Last page"
          disabled={isLastPage}
          onClick={() => onPageIndexChange(totalPages - 1)}
        >
          <ChevronsRight aria-hidden="true" />
        </IconButton>
      </div>
    </div>
  );
}
