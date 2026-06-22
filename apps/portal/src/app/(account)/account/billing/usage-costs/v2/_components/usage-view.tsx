"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  ChartArea,
  ChartPie,
  CircleDollarSign,
  ChevronDown,
  Clock,
  Container,
  Download,
  Layers,
  Radar,
  Route,
  SlidersHorizontal,
  Table as TableIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { DateTimeRangeSelector } from "@repo/ui/components/date-time-range-selector";
import type {
  DateTimeRangeSelectorPreset,
  DateTimeRangeSelectorTimezoneOption,
} from "@repo/ui/components/date-time-range-selector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { IconButton } from "@repo/ui/components/icon-button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
} from "@repo/ui/components/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import { useAccountState } from "@/lib/mock/account-context";

const WORKSPACE_ALL = "__all__";
const RESOURCE_ALL = "__all__";

type Granularity = "hour" | "day" | "week" | "month";
type BreakdownDim =
  | "billing-dimension"
  | "resource-type"
  | "resource-name"
  | "resource-lifecycle"
  | "workspace";
type ChartType =
  | "stacked-bar"
  | "stacked-area"
  | "bar"
  | "pie"
  | "radar"
  | "composition"
  | "table";

// Built fresh per-render so the presets reflect "now" — preset shifts when the
// page is reopened across day boundaries are intentional and cheap.
function buildPresets(): DateTimeRangeSelectorPreset[] {
  const now = new Date();
  const startOfDay = (d: Date) => {
    const c = new Date(d);
    c.setHours(0, 0, 0, 0);
    return c;
  };
  const endOfDay = (d: Date) => {
    const c = new Date(d);
    c.setHours(23, 59, 59, 999);
    return c;
  };
  const minusHours = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);
  const minusDays = (d: number) =>
    startOfDay(new Date(now.getTime() - d * 24 * 60 * 60 * 1000));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfQuarter = new Date(
    now.getFullYear(),
    Math.floor(now.getMonth() / 3) * 3,
    1,
  );
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  return [
    { label: "Last 6 hours", value: { start: minusHours(6), end: now } },
    { label: "Last 12 hours", value: { start: minusHours(12), end: now } },
    { label: "Today", value: { start: startOfDay(now), end: endOfDay(now) } },
    { label: "Last 3 days", value: { start: minusDays(3), end: now } },
    { label: "Last 7 days", value: { start: minusDays(7), end: now } },
    { label: "Last 30 days", value: { start: minusDays(30), end: now } },
    { label: "Last 90 days", value: { start: minusDays(90), end: now } },
    { label: "This month", value: { start: startOfMonth, end: endOfDay(now) } },
    {
      label: "This quarter",
      value: { start: startOfQuarter, end: endOfDay(now) },
    },
    { label: "This year", value: { start: startOfYear, end: endOfDay(now) } },
  ];
}

const TIMEZONE_OPTIONS: DateTimeRangeSelectorTimezoneOption[] = [
  { label: "UTC", value: "UTC" },
  { label: "America/Los Angeles", value: "America/Los_Angeles" },
  { label: "America/New York", value: "America/New_York" },
  { label: "Europe/London", value: "Europe/London" },
  { label: "Asia/Tokyo", value: "Asia/Tokyo" },
];

interface GranularityOption {
  value: Granularity;
  label: string;
  description: string;
}

const GRANULARITY_OPTIONS: ReadonlyArray<GranularityOption> = [
  { value: "hour", label: "Hour", description: "Hourly buckets, up to 7 days" },
  { value: "day", label: "Day", description: "Daily buckets, up to 90 days" },
  { value: "week", label: "Week", description: "Weekly buckets, up to 1 year" },
  { value: "month", label: "Month", description: "Monthly buckets, multi-year" },
];

const BREAKDOWN_OPTIONS: ReadonlyArray<{ value: BreakdownDim; label: string }> = [
  { value: "billing-dimension", label: "Billing dimension" },
  { value: "resource-type", label: "Resource type" },
  { value: "resource-name", label: "Resource name" },
  { value: "resource-lifecycle", label: "Resource lifecycle" },
  { value: "workspace", label: "Workspace" },
];

// Series definitions per breakdown — names + relative weights. The actual mock
// data builds 30 buckets and normalizes each series's totals so the sum across
// all days equals `weight * totalCost`. Real billing maths is out of scope.
interface BreakdownSeriesSpec {
  name: string;
  weight: number;
}

const SERIES_BY_BREAKDOWN: Record<BreakdownDim, ReadonlyArray<BreakdownSeriesSpec>> = {
  "billing-dimension": [
    { name: "GB-RAM-seconds", weight: 0.55 },
    { name: "Storage GB-month", weight: 0.18 },
    { name: "Requests (per 10k)", weight: 0.14 },
    { name: "Standby GB-hour", weight: 0.08 },
    { name: "Custom domain hours", weight: 0.05 },
  ],
  "resource-type": [
    { name: "Sandboxes", weight: 0.5 },
    { name: "Jobs", weight: 0.2 },
    { name: "Agents", weight: 0.15 },
    { name: "MCP servers", weight: 0.1 },
    { name: "Volumes", weight: 0.05 },
  ],
  "resource-name": [
    { name: "sbx-atlas-rl-prod", weight: 0.42 },
    { name: "agt-tickets-router", weight: 0.18 },
    { name: "job-nightly-eval", weight: 0.16 },
    { name: "mcp-jira-bridge", weight: 0.12 },
    { name: "sbx-dev-scratchpad", weight: 0.12 },
  ],
  "resource-lifecycle": [
    { name: "Active", weight: 0.62 },
    { name: "Standby", weight: 0.23 },
    { name: "Deploying", weight: 0.1 },
    { name: "Idle", weight: 0.05 },
  ],
  workspace: [
    { name: "atlas-rl", weight: 0.58 },
    { name: "prod-agents", weight: 0.28 },
    { name: "dev-scratchpad", weight: 0.14 },
  ],
};

const RESOURCE_TYPE_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "sandboxes", label: "Sandboxes" },
  { value: "agents", label: "Agents" },
  { value: "jobs", label: "Jobs" },
  { value: "mcp-servers", label: "MCP servers" },
  { value: "volumes", label: "Volumes" },
  { value: "agent-drives", label: "Agent drives" },
];

interface ChartTypeOption {
  value: ChartType;
  label: string;
  icon: typeof BarChart3;
}

const TIME_SERIES_CHARTS: ReadonlyArray<ChartTypeOption> = [
  { value: "stacked-bar", label: "Stacked bar", icon: BarChart3 },
  { value: "stacked-area", label: "Stacked area", icon: ChartArea },
];

const TOTAL_VALUE_CHARTS: ReadonlyArray<ChartTypeOption> = [
  { value: "bar", label: "Bar", icon: BarChart3 },
  { value: "pie", label: "Pie", icon: ChartPie },
  { value: "radar", label: "Radar", icon: Radar },
  { value: "composition", label: "Composition", icon: Layers },
  { value: "table", label: "Table", icon: TableIcon },
];

const CHART_LABEL_BY_VALUE: Record<ChartType, ChartTypeOption> = [
  ...TIME_SERIES_CHARTS,
  ...TOTAL_VALUE_CHARTS,
].reduce(
  (acc, opt) => {
    acc[opt.value] = opt;
    return acc;
  },
  {} as Record<ChartType, ChartTypeOption>,
);

const DEFAULT_FILTERS = {
  workspace: WORKSPACE_ALL,
  resource: RESOURCE_ALL,
  granularity: "day" as Granularity,
  // Billing dimension is the only break-down where USAGE values across series
  // share a unit boundary — GB-s, request count, GB-month, etc. are already
  // separated. Defaulting here keeps USAGE meaningful out of the box.
  // (See unit-consistency rule in usage-view's "usageAvailable" derivation.)
  breakdown: "billing-dimension" as BreakdownDim,
  chartType: "stacked-bar" as ChartType,
};

// USAGE values mix incompatible units (GB-s, count, hours) when neither a
// specific resource type is filtered nor the breakdown is billing-dimension.
// COST is always meaningful because everything resolves to dollars.
function isUsageAvailable(breakdown: BreakdownDim, resource: string): boolean {
  return breakdown === "billing-dimension" || resource !== RESOURCE_ALL;
}

const USAGE_DISABLED_TOOLTIP =
  "Usage values mix incompatible units (GB-s, count, hours). Pick a resource type or break down by billing dimension to enable.";

function initialDateRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// Per-series colors — cycled by index. Tokens, not arbitrary hex.
const SERIES_PALETTE: ReadonlyArray<string> = [
  "bg-primary",
  "bg-state-scored",
  "bg-state-warning",
  "bg-state-running",
  "bg-muted-foreground",
];

interface SeriesPoint {
  // Day-of-month label, e.g. "12".
  label: string;
  values: ReadonlyArray<number>;
}

interface UsageDataset {
  seriesNames: ReadonlyArray<string>;
  points: ReadonlyArray<SeriesPoint>;
  /** Series totals matching points order (sum across days per series). */
  seriesTotals: ReadonlyArray<number>;
  /** Last-period series totals — same length / order as `seriesTotals`. */
  lastPeriodTotals: ReadonlyArray<number>;
  /** Last-period stacked totals per point — same length as `points`. */
  lastPeriodStack: ReadonlyArray<number>;
  totalUsage: number;
  totalCost: number;
  /** Delta vs last period as a signed ratio (e.g. +0.14 = +14%). */
  deltaRatio: number;
}

// Stable seeded shapes per index — produces a consistent curve regardless of
// how many series the breakdown picks. Each call to buildMockDataset picks the
// first N shapes to match the chosen series count.
const DAY_SHAPES: ReadonlyArray<ReadonlyArray<number>> = [
  [1, 1.2, 0.9, 1.4, 1.6, 1.1, 0.8, 1.0, 1.5, 1.7, 1.3, 1.1, 1.4, 1.8, 2.0, 1.6, 1.3, 1.5, 1.7, 1.9, 1.4, 1.2, 1.0, 1.3, 1.5, 1.7, 2.1, 1.9, 1.6, 1.4],
  [0.4, 0.5, 0.3, 0.6, 0.7, 0.5, 0.4, 0.6, 0.8, 0.7, 0.5, 0.6, 0.8, 1.0, 0.9, 0.7, 0.5, 0.6, 0.8, 0.9, 0.6, 0.5, 0.4, 0.6, 0.7, 0.8, 1.1, 0.9, 0.7, 0.6],
  [0.3, 0.4, 0.2, 0.5, 0.6, 0.4, 0.3, 0.4, 0.5, 0.6, 0.4, 0.4, 0.6, 0.7, 0.8, 0.6, 0.4, 0.5, 0.6, 0.7, 0.5, 0.4, 0.3, 0.4, 0.5, 0.6, 0.9, 0.7, 0.5, 0.4],
  [0.2, 0.3, 0.2, 0.3, 0.4, 0.3, 0.2, 0.3, 0.4, 0.5, 0.3, 0.3, 0.4, 0.5, 0.6, 0.4, 0.3, 0.4, 0.5, 0.5, 0.4, 0.3, 0.2, 0.3, 0.4, 0.5, 0.6, 0.5, 0.4, 0.3],
  [0.1, 0.1, 0.1, 0.1, 0.2, 0.1, 0.1, 0.1, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3, 0.2, 0.2, 0.2, 0.2, 0.3, 0.2, 0.2, 0.1, 0.2, 0.2, 0.2, 0.3, 0.3, 0.2, 0.2],
];

const LAST_PERIOD_FACTOR = 0.88; // current period burns ~14% steeper than last

function buildMockDataset(
  totalCost: number,
  breakdown: BreakdownDim,
): UsageDataset {
  const specs = SERIES_BY_BREAKDOWN[breakdown];
  const days = DAY_SHAPES[0]!.length;

  // Normalize each series so the sum across days matches `weight * totalCost`.
  const normalized = specs.map((spec, idx) => {
    const shape = DAY_SHAPES[idx % DAY_SHAPES.length]!;
    const shapeSum = shape.reduce((a, b) => a + b, 0);
    const target = spec.weight * totalCost;
    const factor = shapeSum === 0 ? 0 : target / shapeSum;
    return shape.map((v) => v * factor);
  });

  const points: ReadonlyArray<SeriesPoint> = Array.from({ length: days }, (_, dayIdx) => ({
    label: String(dayIdx + 1),
    values: normalized.map((series) => series[dayIdx] ?? 0),
  }));
  const seriesTotals = normalized.map((s) => s.reduce((a, b) => a + b, 0));
  const lastPeriodTotals = seriesTotals.map((t) => t * LAST_PERIOD_FACTOR);
  const lastPeriodStack = Array.from({ length: days }, (_, dayIdx) =>
    normalized.reduce((sum, s) => sum + (s[dayIdx] ?? 0) * LAST_PERIOD_FACTOR, 0),
  );
  const totalUsage = Math.round(totalCost * 80);
  const deltaRatio = 1 / LAST_PERIOD_FACTOR - 1;
  return {
    seriesNames: specs.map((s) => s.name),
    points,
    seriesTotals,
    lastPeriodTotals,
    lastPeriodStack,
    totalUsage,
    totalCost,
    deltaRatio,
  };
}

export default function UsageView() {
  const { state } = useAccountState();
  const [tab, setTab] = useState<"usage" | "cost">("usage");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [timezone, setTimezone] = useState("UTC");
  const presets = useMemo(buildPresets, []);

  const dataset = useMemo<UsageDataset | null>(() => {
    if (state.monthToDateSpendUsd <= 0) return null;
    return buildMockDataset(state.monthToDateSpendUsd, filters.breakdown);
  }, [state.monthToDateSpendUsd, filters.breakdown]);

  const balanceLabel = `$${state.balanceUsd.toFixed(2)}`;
  const usageAvailable = isUsageAvailable(filters.breakdown, filters.resource);

  // When the user moves into an invalid USAGE state (e.g. switches breakdown
  // to "Resource type" with all resources selected), fall back to COST so
  // the page never displays a unit-mixed total.
  useEffect(() => {
    if (!usageAvailable && tab === "usage") setTab("cost");
  }, [usageAvailable, tab]);

  const breakdownLabel =
    BREAKDOWN_OPTIONS.find((opt) => opt.value === filters.breakdown)?.label ??
    "Billing dimension";
  const matchingPreset = presets.find(
    (preset) =>
      preset.value.start.getTime() === dateRange.start.getTime() &&
      preset.value.end.getTime() === dateRange.end.getTime(),
  );
  const timeRangeLabel =
    matchingPreset?.label ??
    `${dateRange.start.toLocaleDateString()} – ${dateRange.end.toLocaleDateString()}`;
  const granularityOption =
    GRANULARITY_OPTIONS.find((opt) => opt.value === filters.granularity) ??
    GRANULARITY_OPTIONS[1]!;
  const chartTypeOption = CHART_LABEL_BY_VALUE[filters.chartType];

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as "usage" | "cost")}
      className="page-shell"
    >
      <header className="page-header">
        <div className="flex items-start justify-between gap-3">
          <h1 className="typography-display font-semibold text-foreground">
            Usage &amp; costs
          </h1>
          <TabsList variant="segmented" aria-label="Usage or cost view">
            {usageAvailable ? (
              <TabsTrigger value="usage">Usage</TabsTrigger>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* Span wrapper keeps tooltip activation alive on the
                      disabled button (disabled buttons swallow pointer events). */}
                  <span>
                    <TabsTrigger value="usage" disabled>
                      Usage
                    </TabsTrigger>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{USAGE_DISABLED_TOOLTIP}</TooltipContent>
              </Tooltip>
            )}
            <TabsTrigger value="cost">Cost</TabsTrigger>
          </TabsList>
        </div>
        <p className="text-muted-foreground">
          Spend, attribution, and trends across this billing account.
        </p>
      </header>

      <div className="flex flex-col gap-8">
        <SpendSummaryBand />

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <WorkspaceChip
                workspaces={state.workspaces}
                value={filters.workspace}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, workspace: value }))
                }
              />
              <ResourceChip
                value={filters.resource}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, resource: value }))
                }
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={filters.breakdown}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    breakdown: value as BreakdownDim,
                  }))
                }
              >
                <ControlTrigger ariaLabel="Break down by" icon={Route}>
                  <span className="text-muted-foreground">Break down by:</span>
                  <span className="text-foreground">{breakdownLabel}</span>
                </ControlTrigger>
                <SelectContent align="end">
                  {BREAKDOWN_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DateTimeRangeSelector
                value={dateRange}
                onChange={setDateRange}
                presets={presets}
                timezone={timezone}
                timezoneOptions={TIMEZONE_OPTIONS}
                onTimezoneChange={setTimezone}
                className="h-8 gap-2 rounded-md typography-body"
                aria-label={`Time range, current value: ${timeRangeLabel}`}
              >
                {timeRangeLabel}
              </DateTimeRangeSelector>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Granularity"
                    className={cn(
                      "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-card px-3 typography-body text-foreground",
                      "hover:bg-secondary-surface focus-visible:bg-form-field-surface focus-visible:shadow-focus-ring focus-visible:outline-none",
                      "data-[state=open]:bg-form-field-surface data-[state=open]:shadow-focus-ring",
                    )}
                  >
                    <Clock
                      aria-hidden="true"
                      className="size-3.5 text-muted-foreground"
                    />
                    <span>{granularityOption.label}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className="size-3.5 text-muted-foreground"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuRadioGroup
                    value={filters.granularity}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        granularity: value as Granularity,
                      }))
                    }
                  >
                    {GRANULARITY_OPTIONS.map((opt) => (
                      <DropdownMenuRadioItem
                        key={opt.value}
                        value={opt.value}
                        className="flex-col items-start gap-0.5 py-2"
                      >
                        <span className="typography-body text-foreground">
                          {opt.label}
                        </span>
                        <span className="typography-caption text-muted-foreground">
                          {opt.description}
                        </span>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Select
                value={filters.chartType}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    chartType: value as ChartType,
                  }))
                }
              >
                <ControlTrigger ariaLabel="Chart type" icon={chartTypeOption.icon}>
                  <span className="text-foreground">{chartTypeOption.label}</span>
                </ControlTrigger>
                <SelectContent align="end">
                  <SelectGroup>
                    <SelectLabel>Time series</SelectLabel>
                    {TIME_SERIES_CHARTS.map((opt) => (
                      <ChartTypeItem key={opt.value} option={opt} />
                    ))}
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Total value</SelectLabel>
                    {TOTAL_VALUE_CHARTS.map((opt) => (
                      <ChartTypeItem key={opt.value} option={opt} />
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <IconButton
                variant="secondary"
                size="md"
                aria-label="Filter settings"
                onClick={() => undefined}
              >
                <SlidersHorizontal />
              </IconButton>

              <Button
                variant="secondary"
                onClick={() =>
                  toast.success("Exported usage data to CSV", {
                    description: "usage-export.csv saved to your downloads.",
                  })
                }
              >
                <Download aria-hidden="true" />
                Export CSV
              </Button>
            </div>
          </div>

          <TabsContent value="usage" className="mt-0 flex flex-col gap-4">
            <BillingHeaderStrip
              dataset={dataset}
              tab="usage"
              balanceLabel={balanceLabel}
              usageAvailable={usageAvailable}
              deltaComparable={Boolean(matchingPreset)}
            />
            <UsagePanel
              dataset={dataset}
              tab="usage"
              chartType={filters.chartType}
            />
            <BreakdownTable dataset={dataset} tab="usage" />
          </TabsContent>

          <TabsContent value="cost" className="mt-0 flex flex-col gap-4">
            <BillingHeaderStrip
              dataset={dataset}
              tab="cost"
              balanceLabel={balanceLabel}
              usageAvailable={usageAvailable}
              deltaComparable={Boolean(matchingPreset)}
            />
            <UsagePanel
              dataset={dataset}
              tab="cost"
              chartType={filters.chartType}
            />
            <BreakdownTable dataset={dataset} tab="cost" />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
}

function SpendSummaryBand() {
  const { state } = useAccountState();
  const mtd = state.monthToDateSpendUsd;
  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  const forecasted = dayOfMonth > 0 ? (mtd / dayOfMonth) * daysInMonth : 0;
  const creditsUsedThisMonth = state.creditHistory
    .filter((entry) => entry.type === "Usage")
    .reduce((sum, entry) => sum + Math.abs(entry.amount), 0);
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(now);
  return (
    <Card className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <SummaryCell
        label="Month-to-date spend"
        value={formatCurrency(mtd)}
        helper={monthLabel}
      />
      <SummaryCell
        label="Forecasted month-end"
        value={formatCurrency(forecasted)}
        helper={`Based on ${dayOfMonth} day${dayOfMonth === 1 ? "" : "s"} of activity`}
      />
      <SummaryCell
        label="Credits used"
        value={formatCurrency(creditsUsedThisMonth)}
        helper="Drawn from wallet this month"
      />
    </Card>
  );
}

interface SummaryCellProps {
  label: string;
  value: string;
  helper: string;
}

function SummaryCell({ label, value, helper }: SummaryCellProps) {
  return (
    <div className="flex flex-col gap-1.5 px-6 py-5">
      <span className="typography-caption text-muted-foreground">{label}</span>
      <span className="font-mono typography-subtitle font-semibold tabular-nums text-foreground">
        {value}
      </span>
      <span className="typography-caption text-muted-foreground">{helper}</span>
    </div>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

interface BreakdownTableProps {
  dataset: UsageDataset | null;
  tab: "usage" | "cost";
}

interface BreakdownRow {
  resource: string;
  workspace: string;
  usage: number;
  cost: number;
}

// Demo rows tying resource × workspace to usage/cost slices of the dataset.
// Shape mirrors what a real "Usage Explorer" backend would return — one row
// per (resource, workspace) pair, with usage units and dollars side by side.
function buildBreakdownRows(dataset: UsageDataset): BreakdownRow[] {
  const resourceTotals = dataset.seriesNames.map((name, idx) => ({
    name,
    total: dataset.seriesTotals[idx] ?? 0,
  }));
  const workspaces: ReadonlyArray<{ slug: string; weight: number }> = [
    { slug: "atlas-rl", weight: 0.58 },
    { slug: "prod-agents", weight: 0.28 },
    { slug: "dev-scratchpad", weight: 0.14 },
  ];
  const rows: BreakdownRow[] = [];
  for (const resource of resourceTotals) {
    for (const ws of workspaces) {
      const cost = resource.total * ws.weight;
      const usage = Math.round(cost * 80);
      if (cost <= 0) continue;
      rows.push({
        resource: resource.name,
        workspace: ws.slug,
        usage,
        cost,
      });
    }
  }
  return rows.sort((a, b) => b.cost - a.cost);
}

function BreakdownTable({ dataset, tab }: BreakdownTableProps) {
  if (!dataset) {
    return null;
  }
  const rows = buildBreakdownRows(dataset);
  return (
    <Card>
      <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
        <h2 className="typography-body font-semibold text-foreground">
          Resource &times; workspace breakdown
        </h2>
        <span className="typography-caption text-muted-foreground">
          Ranked by {tab === "cost" ? "cost" : "credits used"}
        </span>
      </div>
      <table className="w-full border-collapse typography-body">
        <caption className="sr-only">Resource and workspace breakdown</caption>
        <thead>
          <tr className="border-b border-border bg-muted-surface text-left">
            <th
              scope="col"
              className="px-6 py-2 font-mono typography-meta uppercase text-meta-foreground"
            >
              Resource
            </th>
            <th
              scope="col"
              className="px-6 py-2 font-mono typography-meta uppercase text-meta-foreground"
            >
              Workspace
            </th>
            <th
              scope="col"
              className="px-6 py-2 text-right font-mono typography-meta uppercase text-meta-foreground"
            >
              Credits used
            </th>
            <th
              scope="col"
              className="px-6 py-2 text-right font-mono typography-meta uppercase text-meta-foreground"
            >
              Cost
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.resource}-${row.workspace}`}
              className="border-b border-border last:border-b-0"
            >
              <td className="px-6 py-3 text-foreground">{row.resource}</td>
              <td className="px-6 py-3 text-muted-foreground">{row.workspace}</td>
              <td className="px-6 py-3 text-right font-mono tabular-nums text-foreground">
                {row.usage.toLocaleString()}
              </td>
              <td className="px-6 py-3 text-right font-mono tabular-nums text-foreground">
                {formatCurrency(row.cost)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

interface ControlTriggerProps {
  icon: typeof BarChart3;
  ariaLabel: string;
  children: React.ReactNode;
}

function ControlTrigger({ icon: Icon, ariaLabel, children }: ControlTriggerProps) {
  return (
    <SelectTrigger size="sm" aria-label={ariaLabel} className="gap-1.5">
      <Icon aria-hidden="true" className="size-3.5 text-muted-foreground" />
      <span className="flex items-center gap-1">{children}</span>
    </SelectTrigger>
  );
}

interface ChartTypeItemProps {
  option: ChartTypeOption;
}

function ChartTypeItem({ option }: ChartTypeItemProps) {
  const Icon = option.icon;
  return (
    <SelectItem value={option.value}>
      <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
      <span>{option.label}</span>
    </SelectItem>
  );
}

interface FilterChipShellProps {
  ariaLabel: string;
  badge?: React.ReactNode;
  icon?: typeof BarChart3;
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  defaultLabel: string;
  defaultValue: string;
  onChange: (value: string) => void;
}

function FilterChipShell({
  ariaLabel,
  badge,
  icon: Icon,
  value,
  options,
  defaultLabel,
  defaultValue,
  onChange,
}: FilterChipShellProps) {
  const label =
    value === defaultValue
      ? defaultLabel
      : (options.find((opt) => opt.value === value)?.label ?? defaultLabel);
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-card",
        "h-7 typography-label text-foreground",
      )}
    >
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          size="sm"
          aria-label={ariaLabel}
          className={cn(
            "h-full gap-1.5 rounded-none border-0 bg-transparent px-2",
            "focus-visible:bg-transparent data-[state=open]:bg-transparent",
            "data-[state=open]:shadow-none",
          )}
        >
          {badge}
          {Icon ? (
            <Icon aria-hidden="true" className="size-3.5 text-muted-foreground" />
          ) : null}
          <span>{label}</span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={defaultValue}>{defaultLabel}</SelectItem>
          <SelectSeparator />
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <button
        type="button"
        aria-label={`Reset ${ariaLabel.toLowerCase()}`}
        onClick={() => onChange(defaultValue)}
        disabled={value === defaultValue}
        className={cn(
          "flex h-full items-center rounded-r-md border-l border-border px-2",
          "text-muted-foreground hover:bg-hover-surface hover:text-foreground",
          "focus-visible:bg-hover-surface focus-visible:shadow-focus-ring focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:text-text-disabled disabled:hover:bg-transparent",
        )}
      >
        <X aria-hidden="true" className="size-3.5" />
      </button>
    </div>
  );
}

interface WorkspaceChipProps {
  workspaces: ReadonlyArray<{ slug: string; name: string }>;
  value: string;
  onChange: (value: string) => void;
}

function WorkspaceChip({ workspaces, value, onChange }: WorkspaceChipProps) {
  const initial =
    value === WORKSPACE_ALL
      ? null
      : (workspaces.find((ws) => ws.slug === value)?.name.charAt(0) ?? "?");
  return (
    <FilterChipShell
      ariaLabel="Workspace"
      badge={
        initial ? (
          <span className="inline-flex size-4 items-center justify-center rounded-sm bg-primary typography-meta font-semibold text-primary-foreground">
            {initial.toUpperCase()}
          </span>
        ) : undefined
      }
      icon={initial ? undefined : Container}
      value={value}
      options={workspaces.map((ws) => ({ value: ws.slug, label: ws.name }))}
      defaultLabel="All workspaces"
      defaultValue={WORKSPACE_ALL}
      onChange={onChange}
    />
  );
}

interface ResourceChipProps {
  value: string;
  onChange: (value: string) => void;
}

function ResourceChip({ value, onChange }: ResourceChipProps) {
  return (
    <FilterChipShell
      ariaLabel="Resource type"
      icon={CircleDollarSign}
      value={value}
      options={RESOURCE_TYPE_OPTIONS}
      defaultLabel="All resource types"
      defaultValue={RESOURCE_ALL}
      onChange={onChange}
    />
  );
}

interface BillingHeaderStripProps {
  dataset: UsageDataset | null;
  tab: "usage" | "cost";
  balanceLabel: string;
  usageAvailable: boolean;
  /** True when the active range matches a fixed preset so Δ vs last period is
   * meaningful. Custom ranges have no comparable prior period, so the cell
   * shows "—" with an explanation. */
  deltaComparable: boolean;
}

// Period credits + Δ, period dollars, account balance — visible regardless of
// chart type so the user always sees the anchor numbers, not just the curve.
function BillingHeaderStrip({
  dataset,
  tab,
  balanceLabel,
  usageAvailable,
  deltaComparable,
}: BillingHeaderStripProps) {
  const creditsValue = dataset ? dataset.totalUsage.toLocaleString() : "0";
  const dollarsValue = dataset ? `$${dataset.totalCost.toFixed(2)}` : "$0.00";
  const delta = dataset?.deltaRatio ?? 0;
  const deltaPercent = Math.round(delta * 100);
  let deltaLabel = "—";
  let deltaColor = "text-muted-foreground";
  if (deltaPercent > 0) {
    deltaLabel = `▲ +${deltaPercent}%`;
    deltaColor = "text-state-warning";
  } else if (deltaPercent < 0) {
    deltaLabel = `▼ ${deltaPercent}%`;
    deltaColor = "text-state-scored";
  }

  let creditsSecondary: string;
  let creditsSecondaryColor = "text-muted-foreground";
  if (!usageAvailable) {
    creditsSecondary =
      "Mixed units — filter by resource type or break down by billing dimension";
  } else if (!dataset) {
    creditsSecondary = "No usage yet";
  } else if (deltaComparable) {
    creditsSecondary = `${deltaLabel} vs last period`;
    creditsSecondaryColor = deltaColor;
  } else {
    creditsSecondary = "Custom range — Δ requires a comparable period";
  }

  return (
    <Card className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <HeaderCell
        label="Period credits"
        primary={usageAvailable ? creditsValue : "—"}
        primaryClassName={
          usageAvailable && tab === "usage"
            ? "text-foreground"
            : "text-muted-foreground"
        }
        secondary={creditsSecondary}
        secondaryClassName={creditsSecondaryColor}
      />
      <HeaderCell
        label="Period dollars"
        primary={dollarsValue}
        primaryClassName={tab === "cost" ? "text-foreground" : "text-muted-foreground"}
        secondary={dataset ? "Ties to invoice for this billing period" : "Awaiting first charge"}
        secondaryClassName="text-muted-foreground"
      />
      <HeaderCell
        label="Account balance"
        primary={balanceLabel}
        primaryClassName="text-foreground"
        secondary="Reflects credits + payment method"
        secondaryClassName="text-muted-foreground"
      />
    </Card>
  );
}

interface HeaderCellProps {
  label: string;
  primary: string;
  primaryClassName: string;
  secondary: string;
  secondaryClassName: string;
}

function HeaderCell({
  label,
  primary,
  primaryClassName,
  secondary,
  secondaryClassName,
}: HeaderCellProps) {
  return (
    <div className="flex flex-col gap-1.5 px-6 py-5">
      <span className="typography-caption text-muted-foreground">{label}</span>
      <span
        className={cn("typography-subtitle font-semibold tabular-nums", primaryClassName)}
      >
        {primary}
      </span>
      <span className={cn("typography-caption", secondaryClassName)}>{secondary}</span>
    </div>
  );
}

interface UsagePanelProps {
  dataset: UsageDataset | null;
  tab: "usage" | "cost";
  chartType: ChartType;
}

function UsagePanel({ dataset, tab, chartType }: UsagePanelProps) {
  if (!dataset) {
    return (
      <Card className="flex h-80 items-center justify-center px-6">
        <p className="typography-body text-muted-foreground">
          No billing data for this range.
        </p>
      </Card>
    );
  }
  return (
    <Card className="overflow-hidden lg:grid lg:grid-cols-[1fr_280px]">
      <div className="border-b border-border lg:border-b-0 lg:border-r">
        <ChartView dataset={dataset} tab={tab} chartType={chartType} />
      </div>
      <TopContributors dataset={dataset} tab={tab} />
    </Card>
  );
}

interface TopContributorsProps {
  dataset: UsageDataset;
  tab: "usage" | "cost";
}

// "Ranked by contribution" visible without forcing the user to read the
// chart's geometry.
function TopContributors({ dataset, tab }: TopContributorsProps) {
  const items = seriesTotals(dataset);
  const ranked = [...items].sort((a, b) => b.total - a.total).slice(0, 5);
  const grandTotal = items.reduce((a, b) => a + b.total, 0) || 1;
  const grandLast = dataset.lastPeriodTotals.reduce((a, b) => a + b, 0) || 1;
  const formatTotal = (value: number) =>
    tab === "cost"
      ? `$${value.toFixed(2)}`
      : Math.round(value * 80).toLocaleString();
  return (
    <div className="flex flex-col gap-3 px-5 py-5">
      <div className="flex items-baseline justify-between">
        <h3 className="typography-label font-medium text-foreground">
          Top contributors
        </h3>
        <span className="typography-meta uppercase tracking-wider text-muted-foreground">
          {tab === "cost" ? "of total expense" : "of total usage"}
        </span>
      </div>
      <ol className="flex flex-col gap-3">
        {ranked.map((item, idx) => {
          const lastTotal =
            dataset.lastPeriodTotals[items.findIndex((i) => i.name === item.name)] ?? 0;
          const lastShare = lastTotal / grandLast;
          const currentShare = item.total / grandTotal;
          const shareDelta = currentShare - lastShare;
          const deltaPercent = Math.round(shareDelta * 100);
          return (
            <li key={item.name} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn(
                    "inline-block size-2.5 rounded-sm",
                    item.color,
                  )}
                />
                <span className="flex-1 truncate typography-body text-foreground">
                  {idx + 1}. {item.name}
                </span>
                <span className="font-mono typography-caption tabular-nums text-foreground">
                  {formatTotal(item.total)}
                </span>
              </div>
              <div className="relative h-1.5 rounded-sm bg-muted-surface">
                <div
                  className={cn("h-full rounded-sm", item.color)}
                  style={{ width: `${currentShare * 100}%` }}
                  aria-hidden="true"
                />
              </div>
              <span className="typography-caption text-muted-foreground">
                {Math.round(currentShare * 100)}%
                {deltaPercent !== 0 ? (
                  <span
                    className={cn(
                      "ml-1.5",
                      deltaPercent > 0
                        ? "text-state-warning"
                        : "text-state-scored",
                    )}
                  >
                    {deltaPercent > 0 ? `▲ +${deltaPercent}pp` : `▼ ${deltaPercent}pp`}
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

interface ChartViewProps {
  dataset: UsageDataset;
  tab: "usage" | "cost";
  chartType: ChartType;
}

function ChartView({ dataset, tab, chartType }: ChartViewProps) {
  switch (chartType) {
    case "stacked-bar":
      return <StackedBarChart dataset={dataset} tab={tab} />;
    case "stacked-area":
      return <StackedAreaChart dataset={dataset} tab={tab} />;
    case "bar":
      return <SeriesBarChart dataset={dataset} tab={tab} />;
    case "pie":
      return <SeriesPieChart dataset={dataset} tab={tab} />;
    case "table":
      return <SeriesTable dataset={dataset} tab={tab} />;
    case "radar":
    case "composition":
    default:
      return (
        <div className="flex h-80 flex-col items-center justify-center gap-1 px-6">
          <p className="typography-body text-foreground">
            {chartType === "radar" ? "Radar" : "Composition"} view not available
            in this demo.
          </p>
          <p className="typography-caption text-muted-foreground">
            Switch to Bar, Pie, Table, Stacked bar, or Stacked area.
          </p>
        </div>
      );
  }
}

interface StackedBarChartProps {
  dataset: UsageDataset;
  tab: "usage" | "cost";
}

function StackedBarChart({ dataset, tab }: StackedBarChartProps) {
  const maxStack = Math.max(
    ...dataset.points.map((point) => point.values.reduce((a, b) => a + b, 0)),
    0.0001,
  );

  const formatTotal = (value: number) =>
    tab === "cost" ? `$${value.toFixed(2)}` : Math.round(value * 80).toLocaleString();

  return (
    <div className="flex flex-col gap-3 px-6 py-5">
      <div className="relative flex h-64 items-end gap-1">
        {dataset.points.map((point) => {
          const stackTotal = point.values.reduce((a, b) => a + b, 0);
          const stackHeightPercent = (stackTotal / maxStack) * 100;
          return (
            <div
              key={point.label}
              className="group/bar relative flex h-full flex-1 flex-col-reverse items-stretch"
            >
              <div
                className="relative flex flex-col-reverse overflow-hidden rounded-t-sm transition-opacity group-hover/bar:opacity-80"
                style={{ height: `${stackHeightPercent}%`, width: "100%" }}
              >
                {point.values.map((value, seriesIdx) => {
                  if (value <= 0) return null;
                  const sharePercent = (value / stackTotal) * 100;
                  const color =
                    SERIES_PALETTE[seriesIdx % SERIES_PALETTE.length] ??
                    SERIES_PALETTE[0]!;
                  return (
                    <div
                      key={`${point.label}-${seriesIdx}`}
                      className={cn("w-full", color)}
                      style={{ height: `${sharePercent}%` }}
                      aria-hidden="true"
                    />
                  );
                })}
              </div>
              <span className="sr-only">
                Day {point.label}: {formatTotal(stackTotal)}
              </span>
            </div>
          );
        })}
      </div>
      <ChartLegend names={dataset.seriesNames} />
    </div>
  );
}

interface SeriesTotal {
  name: string;
  color: string;
  total: number;
  share: number;
}

// Per-series totals + color lookup — fed into every "total value" chart so
// they share legend ordering and color mapping with the time-series views.
function seriesTotals(dataset: UsageDataset): ReadonlyArray<SeriesTotal> {
  const grandTotal = dataset.seriesTotals.reduce((a, b) => a + b, 0) || 1;
  return dataset.seriesNames.map((name, idx) => ({
    name,
    color: SERIES_PALETTE[idx % SERIES_PALETTE.length] ?? SERIES_PALETTE[0]!,
    total: dataset.seriesTotals[idx] ?? 0,
    share: (dataset.seriesTotals[idx] ?? 0) / grandTotal,
  }));
}

interface StackedAreaChartProps {
  dataset: UsageDataset;
  tab: "usage" | "cost";
}

function StackedAreaChart({ dataset, tab }: StackedAreaChartProps) {
  const maxStack = Math.max(
    ...dataset.points.map((p) => p.values.reduce((a, b) => a + b, 0)),
    0.0001,
  );
  // Build a per-series cumulative path so each series stacks on top of the prior.
  const seriesCount = dataset.seriesNames.length;
  const width = 600;
  const height = 240;
  const stepX = dataset.points.length > 1 ? width / (dataset.points.length - 1) : 0;
  // Cumulative point per index per series (top of the series's band).
  const cumulative: number[][] = dataset.points.map((p) => {
    const out: number[] = [];
    let acc = 0;
    for (let i = 0; i < seriesCount; i++) {
      acc += p.values[i] ?? 0;
      out.push(acc);
    }
    return out;
  });
  const yFor = (value: number) => height - (value / maxStack) * height;

  const bands = Array.from({ length: seriesCount }, (_, idx) => {
    const topPoints = cumulative.map((col, x) => `${x * stepX},${yFor(col[idx] ?? 0)}`);
    const bottomPoints =
      idx === 0
        ? Array.from({ length: dataset.points.length }, (_, x) => `${x * stepX},${height}`)
        : cumulative.map((col, x) => `${x * stepX},${yFor(col[idx - 1] ?? 0)}`).reverse();
    return [...topPoints, ...bottomPoints].join(" ");
  });

  return (
    <div className="flex flex-col gap-3 px-6 py-5">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-64 w-full"
        role="img"
        aria-label={`Stacked area chart of ${tab} by ${dataset.seriesNames.join(", ")}`}
      >
        {bands.map((points, idx) => (
          <polygon
            key={dataset.seriesNames[idx]}
            points={points}
            className={cn(
              "opacity-80",
              dataset.seriesNames[idx] ? "[fill:currentColor]" : "",
              SERIES_PALETTE[idx % SERIES_PALETTE.length]?.replace("bg-", "text-"),
            )}
          />
        ))}
      </svg>
      <ChartLegend names={dataset.seriesNames} />
    </div>
  );
}

interface SeriesBarChartProps {
  dataset: UsageDataset;
  tab: "usage" | "cost";
}

function SeriesBarChart({ dataset, tab }: SeriesBarChartProps) {
  const items = seriesTotals(dataset);
  const max = Math.max(...items.map((i) => i.total), 0.0001);
  const formatTotal = (value: number) =>
    tab === "cost" ? `$${value.toFixed(2)}` : Math.round(value * 80).toLocaleString();
  return (
    <div className="flex h-72 flex-col justify-center gap-3 px-6 py-5">
      {items.map((item) => {
        const widthPercent = (item.total / max) * 100;
        return (
          <div key={item.name} className="flex items-center gap-3">
            <span className="w-28 shrink-0 typography-caption text-muted-foreground">
              {item.name}
            </span>
            <div className="relative h-6 flex-1 rounded-sm bg-muted-surface">
              <div
                className={cn("h-full rounded-sm", item.color)}
                style={{ width: `${widthPercent}%` }}
                aria-hidden="true"
              />
            </div>
            <span className="w-20 shrink-0 text-right font-mono typography-caption tabular-nums text-foreground">
              {formatTotal(item.total)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface SeriesPieChartProps {
  dataset: UsageDataset;
  tab: "usage" | "cost";
}

function SeriesPieChart({ dataset, tab }: SeriesPieChartProps) {
  const items = seriesTotals(dataset);
  const total = items.reduce((a, b) => a + b.total, 0) || 1;
  const radius = 80;
  const cx = 100;
  const cy = 100;
  let acc = 0;
  const formatTotal = (value: number) =>
    tab === "cost" ? `$${value.toFixed(2)}` : Math.round(value * 80).toLocaleString();
  const wedges = items.map((item) => {
    const startAngle = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const endAngle = ((acc + item.total) / total) * Math.PI * 2 - Math.PI / 2;
    acc += item.total;
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const d = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");
    return { ...item, d };
  });

  return (
    <div className="flex flex-col items-center gap-4 px-6 py-5 sm:flex-row sm:items-stretch sm:justify-around">
      <svg
        viewBox="0 0 200 200"
        className="size-48"
        role="img"
        aria-label={`Pie chart of ${tab} by series`}
      >
        {wedges.map((w) => (
          <path
            key={w.name}
            d={w.d}
            className={cn("[fill:currentColor]", w.color.replace("bg-", "text-"))}
          />
        ))}
      </svg>
      <ul className="flex max-w-xs flex-col gap-2 self-center">
        {items.map((item) => (
          <li
            key={item.name}
            className="flex items-center justify-between gap-3 typography-caption"
          >
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cn("inline-block size-2.5 rounded-sm", item.color)}
              />
              <span className="text-foreground">{item.name}</span>
            </span>
            <span className="font-mono tabular-nums text-muted-foreground">
              {formatTotal(item.total)} · {Math.round(item.share * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface SeriesTableProps {
  dataset: UsageDataset;
  tab: "usage" | "cost";
}

function SeriesTable({ dataset, tab }: SeriesTableProps) {
  const items = seriesTotals(dataset);
  const formatTotal = (value: number) =>
    tab === "cost" ? `$${value.toFixed(2)}` : Math.round(value * 80).toLocaleString();
  return (
    <div className="px-6 py-5">
      <table className="w-full border-collapse typography-body">
        <caption className="sr-only">{`Usage breakdown by series`}</caption>
        <thead>
          <tr className="border-b border-border text-left">
            <th
              scope="col"
              className="py-2 font-mono typography-meta uppercase text-meta-foreground"
            >
              Series
            </th>
            <th
              scope="col"
              className="py-2 text-right font-mono typography-meta uppercase text-meta-foreground"
            >
              {tab === "cost" ? "Cost" : "Credits used"}
            </th>
            <th
              scope="col"
              className="py-2 text-right font-mono typography-meta uppercase text-meta-foreground"
            >
              % of total
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.name} className="border-b border-border last:border-b-0">
              <td className="py-3">
                <span className="inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={cn("inline-block size-2.5 rounded-sm", item.color)}
                  />
                  <span className="text-foreground">{item.name}</span>
                </span>
              </td>
              <td className="py-3 text-right font-mono tabular-nums text-foreground">
                {formatTotal(item.total)}
              </td>
              <td className="py-3 text-right tabular-nums text-muted-foreground">
                {Math.round(item.share * 100)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ChartLegendProps {
  names: ReadonlyArray<string>;
}

function ChartLegend({ names }: ChartLegendProps) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 typography-caption text-muted-foreground">
      {names.map((name, idx) => {
        const color = SERIES_PALETTE[idx % SERIES_PALETTE.length] ?? SERIES_PALETTE[0]!;
        return (
          <li key={name} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={cn("inline-block size-2.5 rounded-sm", color)}
            />
            <span>{name}</span>
          </li>
        );
      })}
    </ul>
  );
}
