"use client";

import { useMemo } from "react";
import { cn } from "@repo/ui/lib/cn";
import type { LogEntry } from "@/lib/mock/sandbox-logs-fixtures";

interface SandboxLogsVolumeStripProps {
  entries: ReadonlyArray<LogEntry>;
  windowStart: Date;
  windowEnd: Date;
}

/** Log-volume sparkline strip — binned event count over the active time
 *  range. NOT amplitude. This is the one chart the Logs surface earns: it
 *  answers "when did traffic spike" at a glance and lets Alex line the
 *  spike up against the dense table below. Bars are uniform width;
 *  intensity comes from height + foreground fill against the muted track.
 *
 *  Bin count is fixed at 32 — small enough to scan without aliasing,
 *  dense enough to make a 1-minute spike visible inside the 24h window. */
export default function SandboxLogsVolumeStrip({
  entries,
  windowStart,
  windowEnd,
}: SandboxLogsVolumeStripProps) {
  const { bins, peak } = useMemo(
    () => buildBins(entries, windowStart, windowEnd),
    [entries, windowStart, windowEnd],
  );
  const total = entries.length;
  return (
    <div
      className="flex flex-col gap-2 rounded-md border border-border bg-card p-3"
      aria-label="Log volume over the active time range"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="typography-meta text-meta-foreground">Volume</span>
        <span className="typography-meta tabular-nums text-meta-foreground">
          {total} event{total === 1 ? "" : "s"}
          {peak > 0 ? ` · peak ${peak}/bin` : ""}
        </span>
      </div>
      <div
        role="img"
        aria-label={`${total} events, peak ${peak} per bin across ${BIN_COUNT} bins`}
        className="flex h-12 items-end gap-px"
      >
        {bins.map((count, idx) => {
          const ratio = peak === 0 ? 0 : count / peak;
          const heightPct = count === 0 ? 6 : Math.max(10, ratio * 100);
          return (
            <span
              key={idx}
              className={cn(
                "min-w-[3px] flex-1 rounded-sm",
                count === 0
                  ? "bg-border"
                  : "bg-foreground/70",
              )}
              style={{ height: `${heightPct}%` }}
            />
          );
        })}
      </div>
      <div className="flex items-baseline justify-between typography-meta text-meta-foreground">
        <span>{formatBound(windowStart)}</span>
        <span>{formatBound(windowEnd)}</span>
      </div>
    </div>
  );
}

const BIN_COUNT = 32;

function buildBins(
  entries: ReadonlyArray<LogEntry>,
  start: Date,
  end: Date,
): { bins: ReadonlyArray<number>; peak: number } {
  const startMs = start.getTime();
  const endMs = end.getTime();
  const span = Math.max(1, endMs - startMs);
  const binWidth = span / BIN_COUNT;
  const bins = new Array<number>(BIN_COUNT).fill(0);
  for (const entry of entries) {
    const t = new Date(entry.occurredAt).getTime();
    if (t < startMs || t > endMs) continue;
    const raw = Math.floor((t - startMs) / binWidth);
    const idx = raw >= BIN_COUNT ? BIN_COUNT - 1 : raw;
    bins[idx]! += 1;
  }
  const peak = bins.reduce((m, v) => (v > m ? v : m), 0);
  return { bins, peak };
}

function formatBound(d: Date): string {
  // Compact bound label: short month + day-of-month + 24h time (UTC) —
  // the rail's local-time toggle drives table rows, but the volume strip
  // is the at-a-glance and stays in a single consistent timezone so the
  // bin index ↔ table row mapping never reverses on toggle.
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(d);
}
