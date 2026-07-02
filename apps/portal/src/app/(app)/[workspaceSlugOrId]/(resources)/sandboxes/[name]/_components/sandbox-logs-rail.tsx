"use client";

import { Copy, RefreshCw, Search } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Input } from "@repo/ui/components/input";
import { SegmentedControl } from "@repo/ui/components/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Switch } from "@repo/ui/components/switch";
import { cn } from "@repo/ui/lib/cn";
import type {
  LogSeverity,
  LogSource,
} from "@/lib/mock/sandbox-logs-fixtures";
import { severityToneClasses } from "./sandbox-logs-table";

export type TimeRangeKey = "15m" | "1h" | "6h" | "24h" | "7d";

interface SandboxLogsRailProps {
  source: LogSource;
  onSourceChange: (source: LogSource) => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  timeRange: TimeRangeKey;
  onTimeRangeChange: (r: TimeRangeKey) => void;
  showLocalTime: boolean;
  onShowLocalTimeChange: (next: boolean) => void;
  severityFilter: ReadonlySet<LogSeverity>;
  onSeverityToggle: (level: LogSeverity) => void;
  streaming: boolean;
  onStreamingChange: (next: boolean) => void;
  onRefresh: () => void;
  onCopyLogs: () => void;
}

const SOURCE_OPTIONS: ReadonlyArray<{ value: LogSource; label: string }> = [
  { value: "access", label: "Access" },
  { value: "process", label: "Process" },
  { value: "audit", label: "Audit" },
];

const TIME_RANGE_OPTIONS: ReadonlyArray<{
  value: TimeRangeKey;
  label: string;
}> = [
  { value: "15m", label: "Last 15 minutes" },
  { value: "1h", label: "Last 1 hour" },
  { value: "6h", label: "Last 6 hours" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
];

const SEVERITY_OPTIONS: ReadonlyArray<LogSeverity> = [
  "FATAL",
  "ERROR",
  "WARNING",
  "INFO",
  "DEBUG",
  "TRACE",
  "UNKNOWN",
];

/** Logs tab left rail. Owns streaming / refresh / copy at the top, then
 *  the log-source segmented control, then the filter stack. The rail is
 *  a single column — every control reads top-to-bottom so Alex's eye
 *  doesn't ping-pong. Width is bounded by the parent grid (~260px). */
export default function SandboxLogsRail({
  source,
  onSourceChange,
  searchQuery,
  onSearchQueryChange,
  timeRange,
  onTimeRangeChange,
  showLocalTime,
  onShowLocalTimeChange,
  severityFilter,
  onSeverityToggle,
  streaming,
  onStreamingChange,
  onRefresh,
  onCopyLogs,
}: SandboxLogsRailProps) {
  const streamingId = "logs-streaming";
  const localTimeId = "logs-local-time";
  return (
    <aside
      aria-label="Log filters"
      className="flex flex-col gap-5 rounded-md border border-border bg-card p-4"
    >
      {/* Streaming + refresh pair */}
      <div className="flex flex-col gap-3">
        <label
          htmlFor={streamingId}
          className="inline-flex cursor-pointer items-center justify-between gap-2 typography-body text-foreground"
        >
          <span>Streaming</span>
          <Switch
            id={streamingId}
            size="sm"
            checked={streaming}
            onCheckedChange={onStreamingChange}
            aria-label="Streaming logs"
          />
        </label>
        <Button
          type="button"
          variant="secondary"
          onClick={onRefresh}
          className="justify-center"
        >
          <RefreshCw aria-hidden="true" className="size-3.5" />
          Refresh
        </Button>
      </div>

      {/* Copy logs */}
      <div className="flex flex-col gap-1">
        <Button
          type="button"
          variant="secondary"
          onClick={onCopyLogs}
          className="justify-center"
        >
          <Copy aria-hidden="true" className="size-3.5" />
          Copy logs
        </Button>
        <p className="typography-meta text-meta-foreground">
          Copies up to 2MB of log data.
        </p>
      </div>

      {/* Source segmented control */}
      <div className="flex flex-col gap-2">
        <RailLabel>Log source</RailLabel>
        <SegmentedControl
          value={source}
          onValueChange={(v) => onSourceChange(v as LogSource)}
          aria-label="Log source"
          className="flex w-full"
        >
          {SOURCE_OPTIONS.map((opt) => (
            <SegmentedControl.Item key={opt.value} value={opt.value}>
              {opt.label}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl>
      </div>

      {/* Filters block */}
      <div className="flex flex-col gap-4">
        <RailLabel>Filters</RailLabel>

        <Input
          type="search"
          aria-label="Search in logs"
          placeholder="Search in logs"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          leading={
            <Search aria-hidden="true" className="size-4 text-meta-foreground" />
          }
        />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="logs-time-range"
            className="typography-meta text-meta-foreground"
          >
            Time range
          </label>
          <Select
            value={timeRange}
            onValueChange={(v) => onTimeRangeChange(v as TimeRangeKey)}
          >
            <SelectTrigger
              id="logs-time-range"
              aria-label="Time range"
              className="w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <label
          htmlFor={localTimeId}
          className="inline-flex cursor-pointer items-center gap-2 typography-body text-foreground"
        >
          <Checkbox
            id={localTimeId}
            size="sm"
            checked={showLocalTime}
            onCheckedChange={(v) => onShowLocalTimeChange(v === true)}
            aria-label="Show local time"
          />
          <span>Show local time</span>
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="typography-meta text-meta-foreground">Severity</span>
          <ul role="group" aria-label="Severity filter" className="flex flex-col">
            {SEVERITY_OPTIONS.map((level) => (
              <SeverityRow
                key={level}
                level={level}
                checked={severityFilter.has(level)}
                onToggle={() => onSeverityToggle(level)}
              />
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

function RailLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="typography-meta font-medium text-foreground">
      {children}
    </span>
  );
}

interface SeverityRowProps {
  level: LogSeverity;
  checked: boolean;
  onToggle: () => void;
}

function SeverityRow({ level, checked, onToggle }: SeverityRowProps) {
  const tone = severityToneClasses(level);
  function handleRowClick(event: React.MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("[data-slot=checkbox]")) return;
    onToggle();
  }
  return (
    <li>
      <div
        onClick={handleRowClick}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2 rounded-md px-1 py-1",
          "typography-body text-foreground",
          "hover:bg-muted-surface",
          "has-[[data-slot=checkbox]:focus-visible]:bg-muted-surface",
          "transition-colors duration-fast ease-out-standard",
        )}
      >
        <Checkbox
          checked={checked}
          onCheckedChange={onToggle}
          size="sm"
          aria-label={level}
        />
        <span
          aria-hidden="true"
          className={cn("size-2 shrink-0 rounded-full", tone.dot)}
        />
        <span className="flex-1 select-none text-left font-mono typography-code">
          {level}
        </span>
      </div>
    </li>
  );
}
