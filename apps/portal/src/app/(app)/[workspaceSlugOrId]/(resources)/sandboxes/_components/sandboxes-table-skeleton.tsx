"use client";

// Skeleton column layout mirrors the populated table: checkbox, Name/ID (2
// lines), Status, Region, Alloc. RAM, Peak RAM (24h), Created at, Activity,
// kebab. Header remains active during load — no full-table spinner.

const COLUMN_HEADERS = [
  "",
  "Name / ID",
  "Status",
  "Region",
  "Alloc. RAM",
  "Peak RAM (24h)",
  "Created at",
  "Activity",
  "",
];

export function SandboxesTableSkeleton() {
  return (
    <div className="rounded-md border border-border bg-card">
      <div className="grid grid-cols-[32px_minmax(200px,2fr)_120px_104px_112px_160px_160px_88px_40px] gap-4 border-b border-border bg-muted-surface px-4 py-3 typography-table-header text-muted-foreground">
        {COLUMN_HEADERS.map((header, i) => (
          <span key={i}>{header}</span>
        ))}
      </div>
      <div className="flex flex-col">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[32px_minmax(200px,2fr)_120px_104px_112px_160px_160px_88px_40px] gap-4 border-b border-border px-4 py-4 last:border-b-0"
          >
            <div className="h-4 w-4 animate-pulse rounded-sm bg-muted-surface" />
            <div className="flex flex-col gap-1.5">
              <div className="h-3 w-32 animate-pulse rounded-sm bg-muted-surface" />
              <div className="h-2.5 w-24 animate-pulse rounded-sm bg-muted-surface" />
            </div>
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted-surface" />
            <div className="h-3 w-16 animate-pulse rounded-sm bg-muted-surface" />
            <div className="h-3 w-16 animate-pulse rounded-sm bg-muted-surface" />
            <div className="h-3 w-24 animate-pulse rounded-sm bg-muted-surface" />
            <div className="h-3 w-28 animate-pulse rounded-sm bg-muted-surface" />
            <div className="h-4 w-14 animate-pulse rounded-sm bg-muted-surface" />
            <div className="h-6 w-6 animate-pulse rounded-sm bg-muted-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
