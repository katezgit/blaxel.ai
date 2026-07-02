"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Switch } from "@repo/ui/components/switch";
import { cn } from "@repo/ui/lib/cn";
import type {
  Sandbox,
  SandboxLogLine,
  SandboxProcess,
} from "@/lib/mock/sandboxes";
import BandFrame from "./band-frame";

interface SandboxProcessLogBandProps {
  sandbox: Sandbox;
}

const TIMESTAMP_FMT = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

function startedAtLabel(iso: string): string {
  return TIMESTAMP_FMT.format(new Date(iso));
}

function logTimestamp(iso: string): string {
  const d = new Date(iso);
  const base = TIMESTAMP_FMT.format(d);
  const ms = d.getUTCMilliseconds().toString().padStart(3, "0");
  return `${base}.${ms}`;
}

function sortByCpuDesc(
  processes: ReadonlyArray<SandboxProcess>,
): ReadonlyArray<SandboxProcess> {
  return [...processes].sort((a, b) => b.cpuPct - a.cpuPct);
}

/** §1.7 Process + log tail band. Process table sorted by CPU desc;
 *  `Tail logs` toggle defaults ON (the band auto-scrolls as lines arrive
 *  in a real backend; the mock just renders the static fixture). Log
 *  source is fixed to "Process" inline — Access + Audit live in the
 *  forthcoming Logs tab. `Open in Logs ↗` is a non-functional placeholder
 *  until Phase 3 ships the route.
 *
 *  Deploying renders "Init not yet visible. Waiting for boot trace…";
 *  Terminated renders the absolute termination time + "Processes no longer
 *  running." Both replace the table+log shape entirely. */
export default function SandboxProcessLogBand({
  sandbox,
}: SandboxProcessLogBandProps) {
  const [tail, setTail] = useState(true);
  const tailToggleId = "process-log-tail-toggle";

  const isTerminated =
    sandbox.status === "TERMINATED" || sandbox.status === "DELETING";
  const isDeploying =
    sandbox.status === "DEPLOYING" || sandbox.status === "BUILT";
  const isFailed = sandbox.status === "FAILED";

  if (isTerminated) {
    const terminatedAt = sandbox.timeline.find(
      (e) => e.kind === "terminate",
    )?.occurredAt;
    const terminatedAtLabel = terminatedAt
      ? new Date(terminatedAt).toUTCString()
      : "—";
    return (
      <BandFrame label="Processes">
        <p className="typography-body text-meta-foreground">
          Sandbox terminated at {terminatedAtLabel}. Processes no longer
          running.
        </p>
      </BandFrame>
    );
  }

  if (isDeploying) {
    return (
      <BandFrame label="Processes">
        <p className="typography-body text-meta-foreground">
          Init not yet visible. Waiting for boot trace…
        </p>
      </BandFrame>
    );
  }

  const processes = sortByCpuDesc(sandbox.processes);

  return (
    <BandFrame
      label="Processes"
      action={
        <label
          htmlFor={tailToggleId}
          className="inline-flex cursor-pointer items-center gap-2 typography-body text-foreground"
        >
          <Switch
            id={tailToggleId}
            size="sm"
            checked={tail}
            onCheckedChange={setTail}
            aria-label="Tail logs"
          />
          <span>Tail logs</span>
        </label>
      }
    >
      <div className="flex flex-col gap-6">
        {processes.length === 0 ? (
          <p className="typography-body text-meta-foreground">
            {isFailed
              ? "Sandbox failed to boot — no processes started."
              : "No processes running."}
          </p>
        ) : (
          <ProcessTable processes={processes} />
        )}
        <LogTailPane lines={sandbox.logTail} tail={tail} />
      </div>
    </BandFrame>
  );
}

function ProcessTable({
  processes,
}: {
  processes: ReadonlyArray<SandboxProcess>;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full border-collapse typography-body">
        <thead className="bg-muted-surface">
          <tr className="border-b border-border">
            <Th>PID</Th>
            <Th>Command</Th>
            <Th numeric>CPU</Th>
            <Th numeric>Mem</Th>
            <Th>Started</Th>
          </tr>
        </thead>
        <tbody>
          {processes.map((process) => (
            <tr key={process.pid} className="border-b border-border last:border-b-0">
              <Td mono>{process.pid}</Td>
              <Td mono>{process.command}</Td>
              <Td mono numeric>{process.cpuPct}%</Td>
              <Td mono numeric>{process.memMib} MiB</Td>
              <Td mono>{startedAtLabel(process.startedAt)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ThProps {
  children: React.ReactNode;
  numeric?: boolean;
}

function Th({ children, numeric }: ThProps) {
  return (
    <th
      scope="col"
      className={cn(
        "px-3 py-2 text-left align-middle whitespace-nowrap font-medium text-muted-foreground",
        numeric && "text-right",
      )}
    >
      {children}
    </th>
  );
}

interface TdProps {
  children: React.ReactNode;
  mono?: boolean;
  numeric?: boolean;
}

function Td({ children, mono, numeric }: TdProps) {
  return (
    <td
      className={cn(
        "px-3 py-2 align-middle text-foreground whitespace-nowrap",
        mono && "font-mono typography-code",
        numeric && "text-right tabular-nums",
      )}
    >
      {children}
    </td>
  );
}

interface LogTailPaneProps {
  lines: ReadonlyArray<SandboxLogLine>;
  tail: boolean;
}

function LogTailPane({ lines, tail }: LogTailPaneProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="typography-meta text-meta-foreground">
          Log tail (Process)
          <span className="ml-2 text-meta-foreground">
            ▼ {lines.length} lines
          </span>
        </h3>
        <span
          className="inline-flex items-center gap-1 typography-meta text-meta-foreground opacity-50"
          aria-disabled="true"
          title="Logs tab ships in Phase 3"
        >
          Open in Logs
          <ExternalLink aria-hidden="true" className="size-3.5" />
        </span>
      </div>
      <div className="rounded-md border border-code-border bg-code-bg px-4 py-3">
        {lines.length === 0 ? (
          <p className="font-mono typography-code text-code-muted">
            No log lines yet.
          </p>
        ) : (
          <ol className={cn("flex flex-col gap-0.5")}>
            {lines.map((line, idx) => (
              <LogLine
                key={`${line.occurredAt}-${idx}`}
                line={line}
                anchor={`log-${line.occurredAt}`}
              />
            ))}
          </ol>
        )}
      </div>
      {tail && lines.length > 0 && (
        <p className="typography-meta text-meta-foreground">
          Tailing — new lines append below as they arrive.
        </p>
      )}
    </div>
  );
}

function logLevelClass(level: SandboxLogLine["level"]): string {
  switch (level) {
    case "error":
      return "text-state-errored-text";
    case "warn":
      return "text-state-warning-text";
    case "info":
    case "debug":
      return "text-code-fg";
  }
}

function LogLine({ line, anchor }: { line: SandboxLogLine; anchor: string }) {
  const levelClass = logLevelClass(line.level);
  return (
    <li
      id={anchor}
      className="flex gap-3 whitespace-pre font-mono typography-code"
    >
      <span className="text-code-muted">{logTimestamp(line.occurredAt)}</span>
      <span className="text-code-muted">{line.source}</span>
      <span className={levelClass}>{line.message}</span>
    </li>
  );
}
