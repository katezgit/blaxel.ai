"use client";

import type { ReactNode } from "react";
import { cn } from "@repo/ui/lib/cn";
import type { Sandbox } from "@/lib/mock/sandboxes";

interface SandboxVitalsStripProps {
  sandbox: Sandbox;
}

/** Tier-1 vitals strip per wireframe §1.4 — four counters: Requests · Errors
 * · Peak RAM · Peak CPU. Peak number carries the signal; the mini-strip is
 * decorative texture (not a chart) with a dashed limit line on RAM.
 *
 * During Deploying / Errored: every counter renders an em-dash placeholder
 * because no usage signal exists yet.
 *
 * When `errors > 0` the Errors counter flips to error-grade weight — primary
 * Tier-1 failure signal per the §1.4 failure-signal split. */
export default function SandboxVitalsStrip({ sandbox }: SandboxVitalsStripProps) {
  const { vitals, status } = sandbox;
  const noData = status === "DEPLOYING" || status === "FAILED";

  if (noData) {
    return (
      <Frame>
        <CounterShell label="Requests">
          <EmDash />
        </CounterShell>
        <CounterShell label="Errors">
          <EmDash />
        </CounterShell>
        <CounterShell label="Peak RAM">
          <EmDash />
        </CounterShell>
        <CounterShell label="Peak CPU">
          <EmDash />
        </CounterShell>
      </Frame>
    );
  }

  const { requests, errors, peakRamGiB, ramLimitGiB, peakCpuPct, ramStrip, cpuStrip } =
    vitals;
  const errorsActive = errors > 0;

  return (
    <Frame>
      <CounterShell label="Requests">
        <span className="typography-subtitle font-mono tabular-nums text-foreground">
          {formatTotal(requests.total)}
        </span>
        <StatusBreakdown
          status2xx={requests.status2xx}
          status4xx={requests.status4xx}
          status5xx={requests.status5xx}
        />
      </CounterShell>

      <CounterShell
        label="Errors"
        className={cn(
          errorsActive &&
            "rounded-md bg-state-errored-subtle px-3 py-2 -mx-3 -my-2",
        )}
      >
        <span
          className={cn(
            "typography-subtitle font-mono tabular-nums",
            errorsActive
              ? "font-medium text-state-errored-text"
              : "text-foreground",
          )}
        >
          {errors}
        </span>
        <span className="typography-meta text-meta-foreground">
          {errorsActive ? "in last 1h" : "—"}
        </span>
      </CounterShell>

      <CounterShell label="Peak RAM">
        <span className="typography-subtitle font-mono tabular-nums text-foreground">
          {peakRamGiB.toFixed(1)} / {ramLimitGiB} GiB
        </span>
        <MiniStrip points={ramStrip} showLimit />
        <span className="typography-meta text-meta-foreground">
          (limit {ramLimitGiB} GiB)
        </span>
      </CounterShell>

      <CounterShell label="Peak CPU">
        <span className="typography-subtitle font-mono tabular-nums text-foreground">
          {peakCpuPct}%
        </span>
        <MiniStrip points={cpuStrip} />
        <span className="typography-meta text-meta-foreground">(last 1h)</span>
      </CounterShell>
    </Frame>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <section
      aria-label="Vitals"
      className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-6 sm:grid-cols-4"
    >
      {children}
    </section>
  );
}

interface CounterShellProps {
  label: string;
  children: ReactNode;
  className?: string;
}

function CounterShell({ label, children, className }: CounterShellProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <span className="typography-meta text-meta-foreground">{label}</span>
      {children}
    </div>
  );
}

function EmDash() {
  return (
    <span className="typography-subtitle font-mono text-muted-foreground">—</span>
  );
}

function formatTotal(n: number): string {
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  }
  return String(n);
}

interface StatusBreakdownProps {
  status2xx: number;
  status4xx: number;
  status5xx: number;
}

function StatusBreakdown({
  status2xx,
  status4xx,
  status5xx,
}: StatusBreakdownProps) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-2 typography-meta text-meta-foreground">
      <span>2xx {status2xx}</span>
      <span aria-hidden="true">·</span>
      <span
        className={cn(
          status4xx > 0 && "text-state-warning-text",
        )}
      >
        4xx {status4xx}
      </span>
      <span aria-hidden="true">·</span>
      <span
        className={cn(
          status5xx > 0 && "font-medium text-state-errored-text",
        )}
      >
        5xx {status5xx}
      </span>
    </span>
  );
}

interface MiniStripProps {
  points: ReadonlyArray<number> | null;
  showLimit?: boolean;
}

/** Decorative mini-strip — a sparkline-shaped peak visualization. Renders
 * as Unicode block characters (▁▂▃▄▅▆▇█) plus a dashed `─` tail when
 * `showLimit` is set. Not a chart — the peak number carries the signal.
 * Keeps width to ~6–10 chars so the counter row stays scannable. */
function MiniStrip({ points, showLimit }: MiniStripProps) {
  if (points === null || points.length === 0) {
    return null;
  }
  const blocks = points.map((p) => blockChar(p)).join("");
  return (
    <span
      aria-hidden="true"
      className="font-mono typography-meta text-meta-foreground"
    >
      {blocks}
      {showLimit ? " ─ ─" : ""}
    </span>
  );
}

const BLOCKS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

function blockChar(value: number): string {
  const clamped = Math.max(0, Math.min(1, value));
  const idx = Math.min(BLOCKS.length - 1, Math.floor(clamped * BLOCKS.length));
  return BLOCKS[idx] ?? "▁";
}
