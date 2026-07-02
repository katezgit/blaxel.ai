"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { SegmentedControl } from "@repo/ui/components/segmented-control";
import type { Sandbox } from "@/lib/mock/sandboxes";

type ActivityWindow = "1h" | "6h" | "24h" | "7d";

interface SandboxCardWrapperProps {
  header?: ReactNode;
  children: ReactNode;
}

/** Card wrapper per wireframe §7.2. Structural chrome only — the caller
 *  composes whichever header slot is right for the current tab (activity
 *  chart on Overview, nothing on Settings/Schedules). Follows `card-usage.md
 *  §1` all-three test as stated in §7.2 self-review. */
export function SandboxCardWrapper({
  header,
  children,
}: SandboxCardWrapperProps) {
  return (
    <div className="rounded-md border border-border bg-card">
      {header ?? null}
      <div className="flex flex-col gap-6 border-t border-border px-4 py-4 first:border-t-0">
        {children}
      </div>
    </div>
  );
}

/** 80px activity chart header per wireframe §7.2 — reuses the same
 *  call-count signal that powers §1.4 vitals (`vitals.requests.total`
 *  distributed across the existing `ramStrip` activity pattern), no new API
 *  endpoint. Wireframe §1.4 counters are lifetime-for-this-Sandbox (no time
 *  window), so this chart owns its own local window control — see §7.5 Q4
 *  note in the return report. */
export function SandboxActivityChartHeader({ sandbox }: { sandbox: Sandbox }) {
  const [window, setWindow] = useState<ActivityWindow>("1h");
  const series = useMemo(
    () => buildActivitySeries(sandbox, window),
    [sandbox, window],
  );
  const status = sandbox.status;
  const isLoading = status === "DEPLOYING";

  return (
    <div className="flex flex-col gap-2 px-4 pt-4 pb-3">
      <div className="flex items-center justify-between gap-2">
        <span className="typography-meta text-meta-foreground">Requests</span>
        <SegmentedControl
          aria-label="Activity window"
          value={window}
          onValueChange={(value) => setWindow(value as ActivityWindow)}
        >
          <SegmentedControl.Item value="1h">1h</SegmentedControl.Item>
          <SegmentedControl.Item value="6h">6h</SegmentedControl.Item>
          <SegmentedControl.Item value="24h">24h</SegmentedControl.Item>
          <SegmentedControl.Item value="7d">7d</SegmentedControl.Item>
        </SegmentedControl>
      </div>
      <div className="h-20 w-full">
        {isLoading ? <ChartSkeleton /> : <ActivityChart data={series} />}
      </div>
    </div>
  );
}

interface ActivityDatum {
  bucket: number;
  count: number;
}

function buildActivitySeries(
  sandbox: Sandbox,
  window: ActivityWindow,
): ReadonlyArray<ActivityDatum> {
  const strip = sandbox.vitals.ramStrip;
  const total = sandbox.vitals.requests.total;
  const size = bucketCountFor(window);

  if (strip === null || strip.length === 0 || total === 0) {
    return Array.from({ length: size }, (_, bucket) => ({ bucket, count: 0 }));
  }

  return Array.from({ length: size }, (_, bucket) => {
    const stripIdx = Math.floor((bucket / (size - 1 || 1)) * (strip.length - 1));
    const weight = strip[stripIdx] ?? 0;
    return { bucket, count: Math.round(weight * total * (1 / size) * 4) };
  });
}

function bucketCountFor(window: ActivityWindow): number {
  switch (window) {
    case "1h":
      return 12;
    case "6h":
      return 18;
    case "24h":
      return 24;
    case "7d":
      return 28;
  }
}

function ActivityChart({ data }: { data: ReadonlyArray<ActivityDatum> }) {
  const hasSignal = data.some((d) => d.count > 0);
  if (!hasSignal) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <span className="typography-meta text-meta-foreground">
          No calls in this window.
        </span>
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data as Array<ActivityDatum>}
        margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
      >
        <Line
          type="monotone"
          dataKey="count"
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, fill: "var(--color-primary)" }}
          isAnimationActive={false}
        />
        <Tooltip content={<ActivityTooltip />} cursor={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface TooltipPayload {
  payload: ActivityDatum;
}

interface ActivityTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<TooltipPayload>;
}

function ActivityTooltip({ active, payload }: ActivityTooltipProps) {
  if (!active || payload === undefined || payload.length === 0) return null;
  const datum = payload[0]?.payload;
  if (datum === undefined) return null;
  return (
    <div className="rounded-sm border border-border bg-popover px-2 py-1 font-mono typography-meta text-popover-foreground shadow-popover">
      {datum.count} {datum.count === 1 ? "call" : "calls"}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-full w-full animate-pulse rounded-sm bg-muted-surface" />
  );
}
