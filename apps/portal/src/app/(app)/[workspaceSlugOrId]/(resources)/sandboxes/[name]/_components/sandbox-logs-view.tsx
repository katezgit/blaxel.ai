"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Chip } from "@repo/ui/components/chip";
import {
  LOGS_NOW,
  isTerminalControlTraffic,
  logsForSource,
  type LogEntry,
  type LogSeverity,
  type LogSource,
} from "@/lib/mock/sandbox-logs-fixtures";
import SandboxLogsRail, {
  type TimeRangeKey,
} from "./sandbox-logs-rail";
import SandboxLogsTable from "./sandbox-logs-table";
import SandboxLogsVolumeStrip from "./sandbox-logs-volume-strip";

const ALL_SEVERITIES: ReadonlyArray<LogSeverity> = [
  "FATAL",
  "ERROR",
  "WARNING",
  "INFO",
  "DEBUG",
  "TRACE",
  "UNKNOWN",
];

const TIME_RANGE_MINUTES: Record<TimeRangeKey, number> = {
  "15m": 15,
  "1h": 60,
  "6h": 6 * 60,
  "24h": 24 * 60,
  "7d": 7 * 24 * 60,
};

/** Logs tab body — left rail + main pane (volume strip + dense table).
 *  Routes for filter state through `useState` only; fixtures live in the
 *  mock module, fed straight in. No useEffect-driven sync: every derived
 *  list comes off `useMemo` from the source+filter inputs.
 *
 *  The terminal-control chip is only meaningful for the Access source;
 *  it's gated to that source and hidden for Process/Audit. */
export default function SandboxLogsView() {
  const [source, setSource] = useState<LogSource>("process");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("24h");
  const [showLocalTime, setShowLocalTime] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<ReadonlySet<LogSeverity>>(
    () => new Set(ALL_SEVERITIES),
  );
  const [streaming, setStreaming] = useState(true);
  const [showTerminalControl, setShowTerminalControl] = useState(false);

  const windowEnd = LOGS_NOW;
  const windowStart = useMemo(() => {
    return new Date(
      windowEnd.getTime() - TIME_RANGE_MINUTES[timeRange] * 60_000,
    );
  }, [timeRange, windowEnd]);

  // Source switch resets the terminal-control chip — it's an Access-only
  // affordance, and carrying its state across sources would leak intent
  // (toggling it on Access then switching to Process shouldn't "stick").
  function handleSourceChange(next: LogSource) {
    setSource(next);
    if (next !== "access") setShowTerminalControl(false);
  }

  function handleSeverityToggle(level: LogSeverity) {
    const next = new Set(severityFilter);
    if (next.has(level)) next.delete(level);
    else next.add(level);
    setSeverityFilter(next);
  }

  const sourceEntries = logsForSource(source);

  // Two-stage filter pipeline so the volume strip can show post-filter
  // entries (matches what the table renders), but the terminal-control
  // chip can re-add hidden Access rows independently.
  const visibleEntries = useMemo<ReadonlyArray<LogEntry>>(() => {
    const startMs = windowStart.getTime();
    const endMs = windowEnd.getTime();
    const q = searchQuery.trim().toLowerCase();
    return sourceEntries.filter((entry) => {
      // Access-source default filter: hide /terminal/ws* unless the chip
      // is toggled on. Process / Audit have no equivalent noise class.
      if (
        source === "access" &&
        !showTerminalControl &&
        isTerminalControlTraffic(entry)
      ) {
        return false;
      }
      const t = new Date(entry.occurredAt).getTime();
      if (t < startMs || t > endMs) return false;
      if (!severityFilter.has(entry.level)) return false;
      if (q.length > 0 && !entry.message.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [
    sourceEntries,
    source,
    showTerminalControl,
    windowStart,
    windowEnd,
    severityFilter,
    searchQuery,
  ]);

  const hiddenNoiseCount = useMemo(() => {
    if (source !== "access") return 0;
    const startMs = windowStart.getTime();
    const endMs = windowEnd.getTime();
    return sourceEntries.reduce((n, entry) => {
      if (!isTerminalControlTraffic(entry)) return n;
      const t = new Date(entry.occurredAt).getTime();
      if (t < startMs || t > endMs) return n;
      return n + 1;
    }, 0);
  }, [source, sourceEntries, windowStart, windowEnd]);

  function handleRefresh() {
    toast.info("Logs refreshed", {
      description: `Showing ${visibleEntries.length} entries in window.`,
    });
  }

  async function handleCopyLogs() {
    const text = visibleEntries
      .map(
        (e) =>
          `${e.occurredAt}  ${e.level.padEnd(7)}  ${e.message}`,
      )
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Logs copied", {
        description: `${visibleEntries.length} lines copied to clipboard.`,
      });
    } catch {
      toast.error("Copy failed", {
        description: "Clipboard access was denied.",
      });
    }
  }

  return (
    <section
      aria-label="Logs"
      className="grid grid-cols-1 gap-6 border-t border-border pt-6 lg:grid-cols-[260px_minmax(0,1fr)]"
    >
      <SandboxLogsRail
        source={source}
        onSourceChange={handleSourceChange}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        showLocalTime={showLocalTime}
        onShowLocalTimeChange={setShowLocalTime}
        severityFilter={severityFilter}
        onSeverityToggle={handleSeverityToggle}
        streaming={streaming}
        onStreamingChange={setStreaming}
        onRefresh={handleRefresh}
        onCopyLogs={handleCopyLogs}
      />

      <div className="flex min-w-0 flex-col gap-4">
        <SandboxLogsVolumeStrip
          entries={visibleEntries}
          windowStart={windowStart}
          windowEnd={windowEnd}
        />

        {source === "access" && (hiddenNoiseCount > 0 || showTerminalControl) ? (
          <div className="flex items-center justify-between gap-3">
            <Chip
              checked={showTerminalControl}
              onCheckedChange={setShowTerminalControl}
            >
              Show terminal control traffic
              {hiddenNoiseCount > 0 && !showTerminalControl ? (
                <span className="ml-1 tabular-nums text-meta-foreground">
                  ({hiddenNoiseCount})
                </span>
              ) : null}
            </Chip>
            <span className="typography-meta text-meta-foreground">
              {visibleEntries.length} entries
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-end">
            <span className="typography-meta text-meta-foreground">
              {visibleEntries.length} entries
            </span>
          </div>
        )}

        <SandboxLogsTable
          entries={visibleEntries}
          showLocalTime={showLocalTime}
        />
      </div>
    </section>
  );
}
