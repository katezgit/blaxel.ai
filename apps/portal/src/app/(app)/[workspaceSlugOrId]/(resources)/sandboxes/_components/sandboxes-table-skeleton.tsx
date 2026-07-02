"use client";

const COLUMN_HEADERS = [
  "Name / ID",
  "State",
  "Region",
  "Image",
  "Expires in",
  "",
];

export function SandboxesTableSkeleton() {
  return (
    <div className="rounded-md border border-border bg-card">
      <div className="grid grid-cols-[2fr_1fr_1fr_2fr_1fr_40px] gap-4 border-b border-border bg-muted-surface px-4 py-3 typography-table-header text-muted-foreground">
        {COLUMN_HEADERS.map((header, i) => (
          <span key={i}>{header}</span>
        ))}
      </div>
      <div className="flex flex-col">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[2fr_1fr_1fr_2fr_1fr_40px] gap-4 border-b border-border px-4 py-4 last:border-b-0"
          >
            <div className="flex flex-col gap-1.5">
              <div className="h-3 w-32 animate-pulse rounded-sm bg-muted-surface" />
              <div className="h-2.5 w-24 animate-pulse rounded-sm bg-muted-surface" />
            </div>
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted-surface" />
            <div className="h-3 w-20 animate-pulse rounded-sm bg-muted-surface" />
            <div className="h-3 w-32 animate-pulse rounded-sm bg-muted-surface" />
            <div className="h-3 w-12 animate-pulse rounded-sm bg-muted-surface" />
            <div className="h-6 w-6 animate-pulse rounded-sm bg-muted-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
