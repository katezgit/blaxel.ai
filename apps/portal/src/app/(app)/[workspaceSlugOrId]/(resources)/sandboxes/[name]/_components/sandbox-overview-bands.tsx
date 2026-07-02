"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@repo/ui/components/card";
import { CopyButton } from "@repo/ui/components/copy-button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { cn } from "@repo/ui/lib/cn";
import type { Sandbox } from "@/lib/mock/sandboxes";
import { sandboxQueries } from "@/lib/query/sandboxes";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { peakRamCell } from "../../_components/row-helpers";
import { formatRelative } from "./format-helpers";
import { StatusShapeChart, TinySparkline } from "./overview-tiny-chart";

// Rich Overview view-model derived from the base Sandbox fixture. Time-series
// arrays are fabricated deterministically per sandbox name — flat baselines
// with name-derived perturbations so shape is stable across renders. Real
// backend wiring swaps `deriveOverview()` for a direct read.
interface OverviewModel {
  connectCommand: string;
  endpoints: {
    cli: string;
    rest: string;
    preview: string;
    mcp: string;
  };
  stats: {
    requests: {
      total: number;
      growth: number;
      s2xx: number;
      s4xx: number;
      s5xx: number;
    };
    sandboxCalls: {
      total: number;
      peak: number;
      growth: number;
      series: ReadonlyArray<number>;
    };
    errors: { total: number; series: ReadonlyArray<number> };
    errorRate: { all: number; s4xx: number; s5xx: number };
    ram: {
      used: number;
      limit: number;
      unit: "GiB";
      max: number;
      series: ReadonlyArray<number>;
    };
    cpu: {
      max: number;
      series: ReadonlyArray<number>;
    };
  };
  events: ReadonlyArray<{
    timestamp: string;
    level: "info" | "warning" | "error";
    message: string;
  }>;
  schedules: ReadonlyArray<{
    type: "cron" | "once";
    when: string;
    command: string;
    lastRun: string | null;
  }>;
}

// Deterministic hash from the sandbox name — used to seed all fabricated
// time-series so shape is stable across renders and distinctive per sandbox.
function seedFromName(name: string): number {
  let h = 2166136261;
  for (let i = 0; i < name.length; i += 1) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeSeries(
  seed: number,
  length: number,
  baseline: number,
  amplitude: number,
  spikeAt: number | null,
  spikeMultiplier: number,
): number[] {
  const out: number[] = [];
  let state = seed;
  for (let i = 0; i < length; i += 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const noise = (state % 1000) / 1000 - 0.5;
    let v = baseline + noise * amplitude;
    if (spikeAt !== null && i === spikeAt) v *= spikeMultiplier;
    out.push(Math.max(0, v));
  }
  return out;
}

function deriveOverview(sandbox: Sandbox): OverviewModel {
  const name = sandbox.metadata.name;
  const region = sandbox.spec.region;
  const ramLimit = sandbox.spec.memoryMib / 1024;
  const seed = seedFromName(name);
  const spikeAt = seed % 48;
  const restHost = `sbx-${name}-epzkrc.${region}.bl.run`;
  const requestsSeries = makeSeries(seed, 48, 12, 8, null, 1);
  const callsSeries = makeSeries(seed + 1, 48, 6, 4, spikeAt, 3.5);
  const errorsSeries = makeSeries(seed + 2, 48, 0.1, 0.4, null, 1);
  const ramSeries = makeSeries(seed + 3, 48, ramLimit * 0.55, ramLimit * 0.2, spikeAt, 1.4);
  const cpuSeries = makeSeries(seed + 4, 48, 8, 12, spikeAt, 14);
  const requestsTotal = Math.round(requestsSeries.reduce((a, b) => a + b, 0));
  const s5xx = seed % 7 === 0 ? Math.floor((seed % 11) / 3) : 0;
  const s4xx = seed % 5 === 0 ? Math.floor((seed % 13) / 4) : 0;
  const s2xx = Math.max(0, requestsTotal - s4xx - s5xx);
  const ramMax = Math.max(...ramSeries);
  const cpuMax = Math.max(...cpuSeries);
  return {
    connectCommand: `bl connect sandbox ${name}`,
    endpoints: {
      cli: `bl connect sandbox ${name}`,
      rest: `https://${restHost}`,
      preview: `https://${name}-preview.bl.run`,
      mcp: `https://${restHost}/mcp`,
    },
    stats: {
      requests: {
        total: requestsTotal,
        growth: 10575,
        s2xx,
        s4xx,
        s5xx,
      },
      sandboxCalls: {
        total: Math.round(callsSeries.reduce((a, b) => a + b, 0)),
        peak: Math.round(Math.max(...callsSeries)),
        growth: 10575,
        series: callsSeries,
      },
      errors: {
        total: s4xx + s5xx,
        series: errorsSeries,
      },
      errorRate: {
        all: requestsTotal > 0 ? ((s4xx + s5xx) / requestsTotal) * 100 : 0,
        s4xx: requestsTotal > 0 ? (s4xx / requestsTotal) * 100 : 0,
        s5xx: requestsTotal > 0 ? (s5xx / requestsTotal) * 100 : 0,
      },
      ram: {
        used: Number(ramSeries[ramSeries.length - 1]?.toFixed(1) ?? "0"),
        limit: ramLimit,
        unit: "GiB",
        max: Number(ramMax.toFixed(1)),
        series: ramSeries,
      },
      cpu: {
        max: Math.round(cpuMax),
        series: cpuSeries,
      },
    },
    events: [
      { timestamp: "11:48:12", level: "warning", message: "image_pull_backoff" },
      { timestamp: "11:47:04", level: "info", message: "sandbox.exec" },
      {
        timestamp: "11:32:19",
        level: "info",
        message: "sandbox.connect · via=cli",
      },
    ],
    schedules: [
      {
        type: "cron",
        when: "0 3 * * *",
        command: "npm run cleanup",
        lastRun: "2h ago",
      },
      {
        type: "once",
        when: "2026-07-01 09:00 UTC",
        command: "npm test",
        lastRun: null,
      },
    ],
  };
}

const EVENT_LEVEL_META = {
  info: {
    label: "Info",
    icon: CheckCircle2,
    className: "text-muted-foreground",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    className: "text-state-warning-text",
  },
  error: {
    label: "Error",
    icon: AlertTriangle,
    className: "text-state-errored-text",
  },
} as const;

/** Rich overview surface for the sandbox detail Overview tab — v2 port.
 * Fresh's layout already owns breadcrumb + page-header + tab strip, so this
 * component renders only the body sections: Access tabs → stat cards →
 * charts → events → schedules. Reads sandbox from the hydrated query cache
 * populated in `layout.tsx`. */
export default function SandboxOverviewBands() {
  const { workspaceSlugOrId, name } = useParams<{
    workspaceSlugOrId: string;
    name: string;
  }>();
  const { accountId, workspaceId } = useCurrentTenancy();
  const { data: sandbox } = useQuery(
    sandboxQueries.detail(accountId, workspaceId, name),
  );
  if (sandbox == null) return null;

  const overview = deriveOverview(sandbox);
  const basePath = `/${workspaceSlugOrId}/sandboxes/${sandbox.metadata.name}`;
  const logsHref = `${basePath}/logs`;
  const schedulesHref = `${basePath}/schedules`;

  return (
    <div className="flex flex-col gap-6">
      <AccessSection endpoints={overview.endpoints} />
      <ProvenanceStrip sandbox={sandbox} />
      <StatCardsRow stats={overview.stats} sandbox={sandbox} />
      <SandboxCallsChart stats={overview.stats.sandboxCalls} />
      <RamUsageChart stats={overview.stats.ram} />
      <EventsSection events={overview.events} logsHref={logsHref} />
      <SchedulesSection
        schedules={overview.schedules}
        schedulesHref={schedulesHref}
      />
    </div>
  );
}

// ── Provenance strip — Created / Last used ──────────────────────────────────
// Moved out of the page-heading meta row so the heading stays at-a-glance
// (`slug · region`). FAILED sandboxes never reached a usable state, so the
// last-used slot renders "Deploy failed …" instead.
function ProvenanceStrip({ sandbox }: { sandbox: Sandbox }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 typography-meta text-muted-foreground">
      <span title={sandbox.metadata.createdAt}>
        Created {formatRelative(sandbox.metadata.createdAt)}
      </span>
      <span aria-hidden="true">·</span>
      <LastUsedSegment sandbox={sandbox} />
    </div>
  );
}

function LastUsedSegment({ sandbox }: { sandbox: Sandbox }) {
  if (sandbox.status === "FAILED") {
    return (
      <span title={sandbox.metadata.createdAt}>
        Deploy failed {formatRelative(sandbox.metadata.createdAt)}
      </span>
    );
  }
  if (sandbox.lastUsedAt === null) {
    return <span>Never used</span>;
  }
  return (
    <span title={sandbox.lastUsedAt}>
      Last used {formatRelative(sandbox.lastUsedAt)}
    </span>
  );
}

// ── Section: access (CLI + REST + Preview + MCP) ─────────────────────────────

interface AccessTabEntry {
  value: string;
  label: string;
  endpoint: string;
  description: React.ReactNode;
  copyAriaLabel: string;
}

function AccessSection({
  endpoints,
}: {
  endpoints: OverviewModel["endpoints"];
}) {
  const tabs: ReadonlyArray<AccessTabEntry> = [
    {
      value: "cli",
      label: "bl CLI",
      endpoint: endpoints.cli,
      description: (
        <>
          Opens an interactive session into this sandbox from your local
          terminal. See{" "}
          <AccessRefLink href="#cli-reference">CLI reference</AccessRefLink>.
        </>
      ),
      copyAriaLabel: "Copy bl connect command",
    },
    {
      value: "rest",
      label: "REST API",
      endpoint: endpoints.rest,
      description: (
        <>
          Base URL for this sandbox&apos;s REST API (port sandbox-api:8080). See{" "}
          <AccessRefLink href="#rest-reference">
            sandbox API reference
          </AccessRefLink>
          .
        </>
      ),
      copyAriaLabel: "Copy REST endpoint",
    },
    {
      value: "preview",
      label: "Preview URL",
      endpoint: endpoints.preview,
      description: (
        <>
          Public preview of the primary port. See{" "}
          <AccessRefLink href="#preview-reference">
            preview URLs reference
          </AccessRefLink>
          .
        </>
      ),
      copyAriaLabel: "Copy preview URL",
    },
    {
      value: "mcp",
      label: "MCP endpoint",
      endpoint: endpoints.mcp,
      description: (
        <>
          Built-in MCP server endpoint. See{" "}
          <AccessRefLink href="#mcp-reference">MCP reference</AccessRefLink>.
        </>
      ),
      copyAriaLabel: "Copy MCP endpoint",
    },
  ];
  return (
    <section aria-label="Quick access" className="flex flex-col gap-2">
      {/* Tabs default gap is 24px between the trigger row and its content;
          override to 8px at this call site so the tab + endpoint + description
          read as one connected block, not three sections. */}
      <Tabs defaultValue="cli" className="gap-2">
        {/* Inline "Quick access:" label sits on the same baseline as the tab
            triggers — labels the group without a heading row that would break
            the flow into the endpoint block below. */}
        <div className="flex items-center gap-3">
          <span className="typography-body font-medium text-foreground shrink-0">
            Quick access:
          </span>
          <TabsList variant="underline" className="border-b-0">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <EndpointRow value={tab.endpoint} ariaLabel={tab.copyAriaLabel} />
            <p className="mt-2 typography-caption text-muted-foreground">
              {tab.description}
            </p>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}

function AccessRefLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-primary underline-offset-2 hover:underline"
    >
      {children}
    </Link>
  );
}

function EndpointRow({
  value,
  ariaLabel,
}: {
  value: string;
  ariaLabel: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-page px-3 py-2 typography-code text-foreground">
      <span className="flex-1 truncate">{value}</span>
      <CopyButton value={value} ariaLabel={ariaLabel} />
    </div>
  );
}

// ── Section: 4 stat cards with sparklines ────────────────────────────────────

function StatCardsRow({
  stats,
  sandbox,
}: {
  stats: OverviewModel["stats"];
  sandbox: Sandbox;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Row 1 — 3 stat cards. Error rate folded into Requests card. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <RequestsCard requests={stats.requests} />
        <SandboxCallsCard sandboxCalls={stats.sandboxCalls} />
        <ErrorsCard errors={stats.errors} />
      </div>
      {/* Row 2 — 2 usage cards with mini area charts */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <RamUsageMaxCard ram={stats.ram} sandbox={sandbox} />
        <CpuUsageMaxCard cpu={stats.cpu} />
      </div>
    </div>
  );
}

function RequestsCard({
  requests,
}: {
  requests: OverviewModel["stats"]["requests"];
}) {
  const totalErrors = requests.s4xx + requests.s5xx;
  const errorRate =
    requests.total > 0 ? (totalErrors / requests.total) * 100 : 0;
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-baseline gap-2">
          <span className="typography-caption font-medium text-muted-foreground">
            Requests
          </span>
          <span className="typography-subtitle font-semibold text-foreground tabular-nums">
            {requests.total}
          </span>
          {requests.growth > 0 && <GrowthChip pct={requests.growth} />}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatusCodeCell code="2xx" count={requests.s2xx} isError={false} />
          <StatusCodeCell
            code="4xx"
            count={requests.s4xx}
            isError={requests.s4xx > 0}
          />
          <StatusCodeCell
            code="5xx"
            count={requests.s5xx}
            isError={requests.s5xx > 0}
          />
        </div>
        <div className="flex items-center justify-between typography-caption text-muted-foreground">
          <span>Error rate</span>
          <span
            className={cn(
              "tabular-nums",
              errorRate > 0 ? "text-state-errored-text" : "text-foreground",
            )}
          >
            {errorRate.toFixed(1)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusCodeCell({
  code,
  count,
  isError,
}: {
  code: string;
  count: number;
  isError: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={cn(
          "typography-subtitle font-semibold tabular-nums",
          isError ? "text-state-errored-text" : "text-foreground",
        )}
      >
        {count}
      </span>
      <span className="typography-caption tabular-nums text-muted-foreground">
        {code}
      </span>
    </div>
  );
}

// Growth indicator — neutral color. A big spike in traffic could be great
// (usage growing) or worrying (resources hit). Not our job to editorialize.
function GrowthChip({ pct }: { pct: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 typography-caption tabular-nums text-muted-foreground">
      <ArrowUpRight aria-hidden="true" className="size-3" />
      {pct}%
    </span>
  );
}

function SandboxCallsCard({
  sandboxCalls,
}: {
  sandboxCalls: OverviewModel["stats"]["sandboxCalls"];
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-baseline gap-2">
          <span className="typography-caption font-medium text-muted-foreground">
            Sandbox calls
          </span>
          <span className="typography-subtitle font-semibold text-foreground tabular-nums">
            {sandboxCalls.total}
          </span>
          {sandboxCalls.growth > 0 && (
            <GrowthChip pct={sandboxCalls.growth} />
          )}
        </div>
        <TinySparkline values={sandboxCalls.series} />
      </CardContent>
    </Card>
  );
}

function ErrorsCard({
  errors,
}: {
  errors: OverviewModel["stats"]["errors"];
}) {
  const isHealthy = errors.total === 0;
  // Zero errors → literal flat line at zero. A noisy series would falsely
  // suggest errors happened when the count says otherwise.
  const displayed = isHealthy
    ? new Array(errors.series.length).fill(0)
    : errors.series;
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-baseline gap-2">
          <span className="typography-caption font-medium text-muted-foreground">
            Errors
          </span>
          <span
            className={cn(
              "typography-subtitle font-semibold tabular-nums",
              isHealthy ? "text-foreground" : "text-state-errored-text",
            )}
          >
            {errors.total}
          </span>
          {isHealthy && (
            <span className="typography-caption text-muted-foreground">
              healthy
            </span>
          )}
        </div>
        <TinySparkline
          values={displayed}
          strokeVar={
            isHealthy
              ? "var(--color-muted-foreground)"
              : "var(--color-state-errored)"
          }
        />
      </CardContent>
    </Card>
  );
}

function RamUsageMaxCard({
  ram,
  sandbox,
}: {
  ram: OverviewModel["stats"]["ram"];
  sandbox: Sandbox;
}) {
  const pctOfLimit = (ram.max / ram.limit) * 100;
  // Alloc + Peak (24h) migrated here from the page-heading meta row so the
  // heading stays at-a-glance. Peak carries the same ≥80% warning color as
  // the list column via `peakRamCell`.
  const alloc = sandbox.spec.memoryMib.toLocaleString("en-US");
  const peak = peakRamCell(sandbox);
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-baseline gap-2">
          <span className="typography-caption font-medium text-muted-foreground">
            RAM usage max
          </span>
          <span className="typography-subtitle font-semibold text-foreground tabular-nums">
            {pctOfLimit.toFixed(0)}%
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 typography-caption text-muted-foreground tabular-nums">
          <span>Alloc: {alloc} MB</span>
          <span aria-hidden="true">·</span>
          {peak ? (
            <span>
              Peak (24h):{" "}
              <span
                className={cn(peak.percent >= 80 && "text-state-warning-text")}
              >
                {peak.label}
              </span>
            </span>
          ) : (
            <span>Peak (24h): —</span>
          )}
        </div>
        <div className="h-14 w-full">
          <StatusShapeChart
            values={ram.series}
            limit={ram.limit}
            limitLabel={`Limit (${ram.limit} GiB)`}
            height={56}
            yFormatter={(v) => v.toFixed(1)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function CpuUsageMaxCard({
  cpu,
}: {
  cpu: OverviewModel["stats"]["cpu"];
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-baseline gap-2">
          <span className="typography-caption font-medium text-muted-foreground">
            CPU usage max
          </span>
          <span className="typography-subtitle font-semibold text-foreground tabular-nums">
            {cpu.max}%
          </span>
        </div>
        <div className="h-14 w-full">
          <StatusShapeChart values={cpu.series} height={56} />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Section: sandbox calls chart ─────────────────────────────────────────────

function SandboxCallsChart({
  stats,
}: {
  stats: OverviewModel["stats"]["sandboxCalls"];
}) {
  return (
    <Section
      label="Sandbox calls"
      trailing={
        <span className="typography-caption text-muted-foreground tabular-nums">
          {stats.total} total · peak {stats.peak}
        </span>
      }
    >
      <div className="rounded-md border border-border bg-page p-3">
        <StatusShapeChart values={stats.series} />
      </div>
    </Section>
  );
}

// ── Section: RAM usage chart ─────────────────────────────────────────────────

function RamUsageChart({
  stats,
}: {
  stats: OverviewModel["stats"]["ram"];
}) {
  return (
    <Section
      label="RAM usage"
      trailing={
        <span className="typography-caption text-muted-foreground tabular-nums">
          current {stats.used} {stats.unit} · limit {stats.limit} {stats.unit}
        </span>
      }
    >
      <div className="rounded-md border border-border bg-page p-3">
        <StatusShapeChart
          values={stats.series}
          limit={stats.limit}
          limitLabel={`Limit (${stats.limit} ${stats.unit})`}
          yFormatter={(v) => `${v.toFixed(1)} ${stats.unit}`}
        />
      </div>
    </Section>
  );
}

// ── Section: events ───────────────────────────────────────────────────────────

function EventsSection({
  events,
  logsHref,
}: {
  events: OverviewModel["events"];
  logsHref: string;
}) {
  return (
    <Section
      label="Events"
      trailing={<DeepLink href={logsHref} label="View logs" />}
    >
      <div className="flex flex-col divide-y divide-border rounded-md border border-border">
        {events.map((event, i) => {
          const meta = EVENT_LEVEL_META[event.level];
          const LevelIcon = meta.icon;
          return (
            <div
              key={i}
              className="grid grid-cols-[auto_auto_1fr] items-center gap-3 px-3 py-2 typography-body"
            >
              <span className="font-mono text-muted-foreground tabular-nums">
                {event.timestamp}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5",
                  meta.className,
                )}
              >
                <LevelIcon aria-hidden="true" className="size-3.5" />
                {meta.label}
              </span>
              <span className="font-mono text-foreground truncate">
                {event.message}
              </span>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ── Section: schedules ────────────────────────────────────────────────────────

function SchedulesSection({
  schedules,
  schedulesHref,
}: {
  schedules: OverviewModel["schedules"];
  schedulesHref: string;
}) {
  return (
    <Section
      label="Schedules"
      trailing={<DeepLink href={schedulesHref} label="Manage schedules" />}
    >
      <div className="flex flex-col divide-y divide-border rounded-md border border-border">
        {schedules.map((schedule, i) => (
          <div
            key={i}
            className="grid grid-cols-[64px_1fr_1fr_auto] items-center gap-3 px-3 py-2 typography-body"
          >
            <span className="font-mono text-muted-foreground">
              {schedule.type}
            </span>
            <span className="font-mono text-foreground truncate">
              {schedule.when}
            </span>
            <span className="font-mono text-foreground truncate">
              {schedule.command}
            </span>
            <span className="typography-caption text-muted-foreground tabular-nums">
              {schedule.lastRun ? `last: ${schedule.lastRun}` : "—"}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── Shared: flat band section ─────────────────────────────────────────────────

function Section({
  label,
  trailing,
  children,
}: {
  label: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={label} className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="typography-subtitle text-foreground">{label}</h2>
        {trailing}
      </div>
      {children}
    </section>
  );
}

function DeepLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 typography-body text-muted-foreground hover:text-foreground"
    >
      {label}
      <ArrowRight aria-hidden="true" className="size-3.5" />
    </Link>
  );
}
