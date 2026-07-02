"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ChevronDown,
  Expand,
  Pause,
  Play,
  RefreshCw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Input } from "@repo/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { cn } from "@repo/ui/lib/cn";
import {
  LOGS_NOW,
  logsForSource,
  type LogEntry,
  type LogSeverity,
  type LogSource,
} from "@/lib/mock/sandbox-logs-fixtures";

const LEVELS: ReadonlyArray<LogSeverity> = [
  "FATAL",
  "ERROR",
  "WARNING",
  "INFO",
  "DEBUG",
  "TRACE",
  "UNKNOWN",
];

const LEVEL_DOT: Record<LogSeverity, string> = {
  FATAL: "bg-state-errored",
  ERROR: "bg-state-errored",
  WARNING: "bg-state-warning",
  INFO: "bg-state-running",
  DEBUG: "bg-code-muted",
  TRACE: "bg-code-muted",
  UNKNOWN: "bg-code-muted",
};

const LEVEL_TEXT: Record<LogSeverity, string> = {
  FATAL: "text-state-errored-text",
  ERROR: "text-state-errored-text",
  WARNING: "text-state-warning-text",
  INFO: "text-state-running-text",
  DEBUG: "text-code-muted",
  TRACE: "text-code-muted",
  UNKNOWN: "text-code-muted",
};

const TIME_RANGES = [
  { key: "15m", label: "Last 15m", minutes: 15 },
  { key: "1h", label: "Last 1h", minutes: 60 },
  { key: "6h", label: "Last 6h", minutes: 6 * 60 },
  { key: "24h", label: "Last 24h", minutes: 24 * 60 },
  { key: "7d", label: "Last 7d", minutes: 7 * 24 * 60 },
] as const;

type TimeRangeKey = (typeof TIME_RANGES)[number]["key"];

const VOLUME_BIN_COUNT = 32;

const TIMESTAMP_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const base = TIMESTAMP_FMT.format(d);
  const ms = d.getUTCMilliseconds().toString().padStart(3, "0");
  return `${base}.${ms}Z`;
}

// LEVELS is priority-ordered (FATAL → UNKNOWN); dedupe by color class so
// FATAL+ERROR (both red) collapse to a single stacked dot — the trigger's
// job is signaling color families in play, not enumerating levels.
function pickStackedDotColors(
  enabledLevels: ReadonlyArray<LogSeverity>,
): ReadonlyArray<string> {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const level of LEVELS) {
    if (out.length === 3) break;
    if (!enabledLevels.includes(level)) continue;
    const color = LEVEL_DOT[level];
    if (seen.has(color)) continue;
    seen.add(color);
    out.push(color);
  }
  return out;
}

// Demo stream — synthetic INFO line appended every ~2s so the Live/Paused
// toggle is visibly load-bearing without a real backend. Uses a fixed
// message template keyed off wall-clock ms so each row is unique.
const DEMO_STREAM_INTERVAL_MS = 2000;
const DEMO_STREAM_TEMPLATES: ReadonlyArray<string> = [
  "GET /v1/notes  200  38ms  10.0.4.17",
  "GET /health  200  3ms  10.0.4.18",
  "POST /v1/notes  201  102ms  10.0.4.17",
  "GET /v1/notes/latest  200  27ms  10.0.4.19",
];

/** Logs tab body — v2 dark-terminal styling. Top toolbar splits into a
 *  left search input and a right cluster (source select + time range
 *  menu + severity popover). Volume band binned to 32 slots below. The
 *  table sits inside a `bg-code-bg` panel; header row exposes a
 *  state-dependent action cluster — Pause+Fullscreen while live,
 *  Play+Refresh+Fullscreen while paused. Pausing accumulates new stream
 *  rows in a hidden buffer; resuming flushes and auto-scrolls to bottom.
 *  Refresh drops the accumulated live rows + buffer back to the base
 *  fixture window without leaving the paused state. */
export default function SandboxLogsView() {
  const searchParams = useSearchParams();
  const sourceParam = searchParams.get("source");
  const initialSource: LogSource =
    sourceParam === "audit" || sourceParam === "access" ? sourceParam : "process";

  const [source, setSource] = useState<LogSource>(initialSource);
  const [search, setSearch] = useState("");
  const [timeRangeKey, setTimeRangeKey] = useState<TimeRangeKey>("24h");
  const [enabledLevels, setEnabledLevels] =
    useState<ReadonlyArray<LogSeverity>>(LEVELS);
  const [paused, setPaused] = useState(false);
  const [liveEntries, setLiveEntries] = useState<ReadonlyArray<LogEntry>>([]);
  const [buffer, setBuffer] = useState<ReadonlyArray<LogEntry>>([]);
  const scrollRootRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const tickRef = useRef(0);

  // Radix ScrollArea's scroll container is the Viewport, not the Root. Auto-
  // follow + resume-scroll-to-bottom both need scrollTop on the viewport;
  // querying by data-slot avoids a viewportRef API the primitive doesn't ship.
  const getScrollViewport = (): HTMLElement | null =>
    scrollRootRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    ) ?? null;

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      const tick = tickRef.current++;
      const template =
        DEMO_STREAM_TEMPLATES[tick % DEMO_STREAM_TEMPLATES.length]!;
      const entry: LogEntry = {
        id: `live-${now}-${tick}`,
        occurredAt: new Date(now).toISOString(),
        level: "INFO",
        message: template,
      };
      if (pausedRef.current) {
        setBuffer((prev) => [...prev, entry]);
      } else {
        setLiveEntries((prev) => [...prev, entry]);
      }
    }, DEMO_STREAM_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  const resumeStream = () => {
    setLiveEntries((prev) => [...prev, ...buffer]);
    setBuffer([]);
    setPaused(false);
    requestAnimationFrame(() => {
      const el = getScrollViewport();
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  const pauseStream = () => {
    setPaused(true);
  };

  // Manual re-fetch in the fixture-only world: drop accumulated live-stream
  // rows + any buffered rows and let `filtered` fall back to the base
  // fixture window for the current source. Stays paused.
  const refreshLogs = () => {
    setLiveEntries([]);
    setBuffer([]);
  };

  const activeRange =
    TIME_RANGES.find((r) => r.key === timeRangeKey) ?? TIME_RANGES[3];

  const windowEnd = LOGS_NOW;
  const windowStart = useMemo(
    () => new Date(windowEnd.getTime() - activeRange.minutes * 60_000),
    [windowEnd, activeRange.minutes],
  );

  const filtered = useMemo<ReadonlyArray<LogEntry>>(() => {
    const startMs = windowStart.getTime();
    // Live entries carry now-timestamps that sit past LOGS_NOW; extend the
    // upper bound so demo-stream rows are not filtered out by the fixed
    // window anchor.
    const endMs = Math.max(windowEnd.getTime(), Date.now());
    const query = search.trim().toLowerCase();
    const combined = [...logsForSource(source), ...liveEntries];
    return combined.filter((entry) => {
      const t = new Date(entry.occurredAt).getTime();
      if (t < startMs || t > endMs) return false;
      if (!enabledLevels.includes(entry.level)) return false;
      if (query.length === 0) return true;
      return entry.message.toLowerCase().includes(query);
    });
  }, [source, search, enabledLevels, windowStart, windowEnd, liveEntries]);

  const { bins, peak } = useMemo(
    () => buildVolumeBins(filtered, windowStart, windowEnd),
    [filtered, windowStart, windowEnd],
  );

  const toggleLevel = (level: LogSeverity) => {
    setEnabledLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
    );
  };

  // Auto-follow to bottom while live streaming, so new rows stay in view.
  const visibleCount = filtered.length;
  useEffect(() => {
    if (paused) return;
    const el = getScrollViewport();
    if (el) el.scrollTop = el.scrollHeight;
  }, [visibleCount, paused]);

  const bufferCount = buffer.length;
  const bufferNoun = bufferCount === 1 ? "entry" : "entries";
  const resumeIndicatorLabel =
    bufferCount > 0
      ? `Resume live tail and flush ${bufferCount} buffered ${bufferNoun}`
      : "Resume live tail";

  return (
    <section aria-label="Logs" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Search in logs"
            placeholder="Search in logs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Select
            value={source}
            onValueChange={(v) => setSource(v as LogSource)}
          >
            <SelectTrigger aria-label="Log source">
              <span className="text-muted-foreground">Source ·</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="access">Access</SelectItem>
              <SelectItem value="process">Process</SelectItem>
              <SelectItem value="audit">Audit</SelectItem>
            </SelectContent>
          </Select>
          <TimeRangeMenu value={timeRangeKey} onChange={setTimeRangeKey} />
          <SeverityMenu
            enabledLevels={enabledLevels}
            onToggleLevel={toggleLevel}
          />
        </div>
      </div>

      <VolumeBand
        bins={bins}
        peak={peak}
        totalEvents={filtered.length}
        windowStart={windowStart}
        windowEnd={windowEnd}
      />

      <div className="flex flex-col overflow-hidden rounded-lg border border-code-border bg-code-bg">
        <div className="flex items-center justify-between gap-4 border-b border-code-border px-3 py-1.5 typography-meta text-code-muted">
          <div className="flex items-center gap-3">
            {paused ? (
              <button
                type="button"
                onClick={resumeStream}
                aria-label={resumeIndicatorLabel}
                className="flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 transition-colors hover:bg-white/5 hover:text-code-fg"
              >
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-state-warning"
                />
                Paused
                {bufferCount > 0 ? (
                  <span className="text-code-muted">({bufferCount} new)</span>
                ) : null}
              </button>
            ) : (
              <span className="flex items-center gap-1.5 px-1.5 py-0.5">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-state-scored animate-pulse"
                />
                Live
              </span>
            )}
            <span>
              {filtered.length} {filtered.length === 1 ? "entry" : "entries"} ·{" "}
              {activeRange.label.toLowerCase()}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            {paused ? (
              <button
                type="button"
                aria-label="Resume live tail"
                onClick={resumeStream}
                className="rounded-sm p-1 transition-colors hover:bg-white/10 hover:text-code-fg"
              >
                <Play aria-hidden="true" className="size-3.5" />
              </button>
            ) : (
              <button
                type="button"
                aria-label="Pause live tail"
                onClick={pauseStream}
                className="rounded-sm p-1 transition-colors hover:bg-white/10 hover:text-code-fg"
              >
                <Pause aria-hidden="true" className="size-3.5" />
              </button>
            )}
            <button
              type="button"
              aria-label="Refresh logs"
              onClick={refreshLogs}
              disabled={!paused}
              className="rounded-sm p-1 transition-colors hover:bg-white/10 hover:text-code-fg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-code-muted"
            >
              <RefreshCw aria-hidden="true" className="size-3.5" />
            </button>
            <button
              type="button"
              aria-label="Fullscreen"
              onClick={() =>
                toast.info(
                  "Fullscreen mode: collapse sidebar to icon rail (Esc to exit).",
                )
              }
              className="rounded-sm p-1 transition-colors hover:bg-white/10 hover:text-code-fg"
            >
              <Expand aria-hidden="true" className="size-3.5" />
            </button>
          </div>
        </div>
        <ScrollArea
          ref={scrollRootRef}
          className="h-[min(calc(100vh-24rem),35rem)]"
        >
          <table className="w-full border-collapse typography-code text-code-fg">
            <thead className="sticky top-0 z-10 bg-code-bg">
              <tr className="border-b border-code-border text-code-muted">
                <LogHeaderCell className="w-12 text-right">#</LogHeaderCell>
                <LogHeaderCell className="w-56">Timestamp</LogHeaderCell>
                <LogHeaderCell className="w-24">Level</LogHeaderCell>
                <LogHeaderCell>Message</LogHeaderCell>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center typography-body text-code-muted"
                  >
                    No log entries match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((entry, index) => (
                  <tr
                    key={entry.id}
                    className="border-b border-code-border/60 transition-colors hover:bg-white/5"
                  >
                    <LogCell className="text-right text-code-muted tabular-nums">
                      {index + 1}
                    </LogCell>
                    <LogCell className="whitespace-nowrap text-code-muted tabular-nums">
                      {formatTimestamp(entry.occurredAt)}
                    </LogCell>
                    <LogCell>
                      <span className="flex items-center gap-1.5">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "size-1.5 rounded-full",
                            LEVEL_DOT[entry.level],
                          )}
                        />
                        <span
                          className={cn("font-medium", LEVEL_TEXT[entry.level])}
                        >
                          {entry.level}
                        </span>
                      </span>
                    </LogCell>
                    <LogCell className="text-code-fg">{entry.message}</LogCell>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ScrollArea>
      </div>
    </section>
  );
}

interface VolumeBandProps {
  bins: ReadonlyArray<number>;
  peak: number;
  totalEvents: number;
  windowStart: Date;
  windowEnd: Date;
}

function VolumeBand({
  bins,
  peak,
  totalEvents,
  windowStart,
  windowEnd,
}: VolumeBandProps) {
  return (
    <div className="flex flex-col gap-1">
      <div
        role="img"
        aria-label={`Event volume histogram, ${totalEvents} events total`}
        className="flex h-8 items-end gap-0.5"
      >
        {bins.map((count, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="flex-1 rounded-t-xs bg-primary/60"
            style={{
              height: `${peak === 0 ? 6 : Math.max(6, (count / peak) * 100)}%`,
            }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between typography-meta text-muted-foreground">
        <span>{formatBound(windowStart)}</span>
        <span>
          {totalEvents} events{peak > 0 ? ` · peak ${peak}/bin` : ""}
        </span>
        <span>{formatBound(windowEnd)}</span>
      </div>
    </div>
  );
}

interface TimeRangeMenuProps {
  value: TimeRangeKey;
  onChange: (v: TimeRangeKey) => void;
}

function TimeRangeMenu({ value, onChange }: TimeRangeMenuProps) {
  const label = TIME_RANGES.find((r) => r.key === value)?.label ?? value;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" aria-label="Time range">
          {label}
          <ChevronDown aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {TIME_RANGES.map((range) => (
          <DropdownMenuItem
            key={range.key}
            onSelect={() => onChange(range.key)}
          >
            {range.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface SeverityMenuProps {
  enabledLevels: ReadonlyArray<LogSeverity>;
  onToggleLevel: (level: LogSeverity) => void;
}

function SeverityMenu({ enabledLevels, onToggleLevel }: SeverityMenuProps) {
  const enabledCount = enabledLevels.length;
  const totalCount = LEVELS.length;
  const stackedDotColors = pickStackedDotColors(enabledLevels);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">
          <span aria-hidden="true" className="flex items-center">
            {stackedDotColors.map((color, i) => (
              <span
                key={color}
                className={cn(
                  "size-2 rounded-full border border-background",
                  i > 0 && "-ml-1.5",
                  color,
                )}
              />
            ))}
          </span>
          Severity {enabledCount}/{totalCount}
          <ChevronDown aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <div className="flex flex-col gap-0.5">
          {LEVELS.map((level) => {
            const isEnabled = enabledLevels.includes(level);
            return (
              <button
                key={level}
                type="button"
                onClick={() => onToggleLevel(level)}
                className="flex items-center justify-between rounded-sm px-2 py-1.5 text-left transition-colors hover:bg-hover-surface"
              >
                <span className="flex items-center gap-2 typography-body">
                  <span
                    aria-hidden="true"
                    className={cn("size-2 rounded-full", LEVEL_DOT[level])}
                  />
                  <span className="text-foreground">{level}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-4 rounded border transition-colors",
                    isEnabled
                      ? "border-primary bg-primary"
                      : "border-border bg-background",
                  )}
                />
                <span className="sr-only">
                  {isEnabled ? "enabled" : "disabled"}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface LogCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
}

function LogHeaderCell({ children, className, ...props }: LogCellProps) {
  return (
    <th
      scope="col"
      className={cn(
        "px-3 py-2 text-left typography-meta font-medium",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

function LogCell({ children, className, ...props }: LogCellProps) {
  return (
    <td className={cn("px-3 py-1.5 align-top", className)} {...props}>
      {children}
    </td>
  );
}

function formatBound(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(d);
}

function buildVolumeBins(
  entries: ReadonlyArray<LogEntry>,
  start: Date,
  end: Date,
): { bins: ReadonlyArray<number>; peak: number } {
  const startMs = start.getTime();
  const endMs = end.getTime();
  const span = Math.max(1, endMs - startMs);
  const binWidth = span / VOLUME_BIN_COUNT;
  const bins = new Array<number>(VOLUME_BIN_COUNT).fill(0);
  for (const entry of entries) {
    const t = new Date(entry.occurredAt).getTime();
    if (t < startMs || t > endMs) continue;
    const raw = Math.floor((t - startMs) / binWidth);
    const idx = raw >= VOLUME_BIN_COUNT ? VOLUME_BIN_COUNT - 1 : raw;
    bins[idx]! += 1;
  }
  const peak = bins.reduce((m, v) => (v > m ? v : m), 0);
  return { bins, peak };
}
