"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

interface TinySparklineProps {
  values: ReadonlyArray<number>;
  /** Optional palette token override — defaults to --color-primary. */
  strokeVar?: string;
  height?: number;
}

// Compact sparkline for a stat card. Area-fill mode; no axes or grid — the
// value above already anchors the number, the shape here is the status signal
// (flat = healthy, spike = investigate). Linear interpolation preserves the
// spike character seen in production (monotone smooths peaks away).
export function TinySparkline({
  values,
  strokeVar = "var(--color-primary)",
  height = 36,
}: TinySparklineProps) {
  const data = values.map((v, i) => ({ i, v }));
  return (
    <div aria-hidden="true" style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
        >
          <Area
            type="linear"
            dataKey="v"
            stroke={strokeVar}
            strokeWidth={1.25}
            fill={strokeVar}
            fillOpacity={0.18}
            isAnimationActive={false}
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface StatusShapeChartProps {
  values: ReadonlyArray<number>;
  /** Optional dashed limit line — RAM chart uses the max in GiB. */
  limit?: number;
  /** Label rendered next to the dashed limit line. */
  limitLabel?: string;
  /** Minutes between successive data points (default 30 → 24h window at 48 points). */
  intervalMinutes?: number;
  /** Anchor time for the most-recent point (default = now). */
  endsAt?: Date;
  /** Formatter for Y-axis tick labels (default = integer). */
  yFormatter?: (v: number) => string;
  strokeVar?: string;
  height?: number;
}

// Full-width status-shape chart. Sharp linear interpolation preserves spike
// morphology (flat baseline + sudden peak = incident marker), dense X-axis
// timestamps let Alex localize the peak, dashed limit line + inline label
// answers "how close were we?" — this is the production reference pattern.
export function StatusShapeChart({
  values,
  limit,
  limitLabel,
  intervalMinutes = 30,
  endsAt,
  yFormatter = (v) => String(Math.round(v)),
  strokeVar = "var(--color-primary)",
  height = 220,
}: StatusShapeChartProps) {
  const end = (endsAt ?? new Date()).getTime();
  const intervalMs = intervalMinutes * 60_000;
  const data = values.map((v, i) => {
    const t = new Date(end - (values.length - 1 - i) * intervalMs);
    return { t: t.getTime(), tLabel: formatTick(t), v };
  });
  const dataMax = Math.max(...values, limit ?? 0);
  const domainMax = Math.ceil(dataMax * 1.1);

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 12, bottom: 4, left: 4 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="var(--color-border)"
            strokeOpacity={0.55}
          />
          <XAxis
            dataKey="tLabel"
            tick={{
              fontSize: 10,
              fill: "var(--color-meta-foreground)",
            }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={40}
            dy={4}
          />
          <YAxis
            domain={[0, domainMax]}
            width={42}
            tick={{
              fontSize: 10,
              fill: "var(--color-meta-foreground)",
            }}
            tickLine={false}
            axisLine={false}
            tickFormatter={yFormatter}
          />
          <Area
            type="linear"
            dataKey="v"
            stroke={strokeVar}
            strokeWidth={1.5}
            fill={strokeVar}
            fillOpacity={0.16}
            isAnimationActive={false}
            dot={false}
            activeDot={false}
          />
          {limit !== undefined && (
            <ReferenceLine
              y={limit}
              stroke="var(--color-state-errored)"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={
                limitLabel
                  ? {
                      value: limitLabel,
                      position: "insideTopRight",
                      fill: "var(--color-meta-foreground)",
                      fontSize: 10,
                      dy: -4,
                    }
                  : undefined
              }
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Compact tick formatter matching production: "10:50 AM", "PM4:15" style.
// Recharts' auto-thinning + interval="preserveStartEnd" handles the density.
function formatTick(d: Date): string {
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  const mm = m < 10 ? `0${m}` : String(m);
  return `${h}:${mm} ${ampm}`;
}
