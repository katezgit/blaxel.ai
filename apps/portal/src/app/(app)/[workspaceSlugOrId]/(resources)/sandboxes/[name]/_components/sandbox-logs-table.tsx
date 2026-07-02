"use client";

import { cn } from "@repo/ui/lib/cn";
import type { LogEntry, LogSeverity } from "@/lib/mock/sandbox-logs-fixtures";

interface SandboxLogsTableProps {
  entries: ReadonlyArray<LogEntry>;
  showLocalTime: boolean;
}

/** Dense forensic log table — `# line · timestamp · level · message`. The
 *  table fills the remaining viewport beneath the volume strip; tight row
 *  height (24px) plus monospaced rows means a typical 1080p viewport
 *  shows ~35 rows without scroll, matching production density. */
export default function SandboxLogsTable({
  entries,
  showLocalTime,
}: SandboxLogsTableProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-md border border-border bg-card p-6">
        <p className="typography-body text-meta-foreground">
          No log lines match the active filters.
        </p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-md border border-border bg-card">
      <table className="w-full border-collapse font-mono typography-code">
        <thead className="bg-muted-surface">
          <tr className="border-b border-border">
            <Th className="w-12 text-right">#</Th>
            <Th className="w-44">Timestamp</Th>
            <Th className="w-20">Level</Th>
            <Th>Message</Th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr
              key={entry.id}
              className="border-b border-border last:border-b-0 hover:bg-muted-surface/60"
            >
              <Td className="w-12 text-right text-meta-foreground tabular-nums">
                {idx + 1}
              </Td>
              <Td className="w-44 whitespace-nowrap text-meta-foreground">
                {formatTimestamp(entry.occurredAt, showLocalTime)}
              </Td>
              <Td className="w-20">
                <LevelTag level={entry.level} />
              </Td>
              <Td className="text-foreground">
                <span className="whitespace-pre-wrap break-all">
                  {entry.message}
                </span>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "px-3 py-2 text-left align-middle whitespace-nowrap font-medium text-muted-foreground",
        className,
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={cn("px-3 py-1.5 align-top text-foreground", className)}
    >
      {children}
    </td>
  );
}

function LevelTag({ level }: { level: LogSeverity }) {
  const tone = severityToneClasses(level);
  return (
    <span className={cn("inline-flex items-center gap-1.5", tone.text)}>
      <span
        aria-hidden="true"
        className={cn("size-1.5 shrink-0 rounded-full", tone.dot)}
      />
      <span className="font-medium tabular-nums">{level}</span>
    </span>
  );
}

interface SeverityTone {
  text: string;
  dot: string;
}

/** Severity tone bindings. FATAL + ERROR collapse onto the errored channel;
 *  WARNING onto warning; INFO onto running (the calm-good color reused
 *  across the dashboard for steady-state signal); DEBUG / TRACE / UNKNOWN
 *  stay muted so they recede into the dense table. */
export function severityToneClasses(level: LogSeverity): SeverityTone {
  switch (level) {
    case "FATAL":
    case "ERROR":
      return {
        text: "text-state-errored-text",
        dot: "bg-state-errored",
      };
    case "WARNING":
      return {
        text: "text-state-warning-text",
        dot: "bg-state-warning",
      };
    case "INFO":
      return {
        text: "text-state-running-text",
        dot: "bg-state-running",
      };
    case "DEBUG":
    case "TRACE":
    case "UNKNOWN":
      return {
        text: "text-muted-foreground",
        dot: "bg-muted-foreground/60",
      };
  }
}

const UTC_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

const LOCAL_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function formatTimestamp(iso: string, local: boolean): string {
  const d = new Date(iso);
  const base = local ? LOCAL_FMT.format(d) : UTC_FMT.format(d);
  const ms = d.getUTCMilliseconds().toString().padStart(3, "0");
  return `${base}.${ms}${local ? "" : "Z"}`;
}
