import { Progress } from "@repo/ui/components/progress";
import { cn } from "@repo/ui/lib/cn";

interface SummaryTileProps {
  label: string;
  used: number;
  limit: number;
  unit?: string;
}

function progressStateFor(percent: number): "neutral" | "warning" | "error" {
  if (percent >= 90) return "error";
  if (percent >= 70) return "warning";
  return "neutral";
}

function SummaryTile({ label, used, limit, unit }: SummaryTileProps) {
  const percent = limit > 0 ? Math.round((used / limit) * 100) : 0;
  const state = progressStateFor(percent);
  const unitSuffix = unit ? ` ${unit}` : "";
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <span className="typography-caption text-muted-foreground">{label}</span>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono typography-display tabular-nums text-foreground">
          {used} / {limit}
          {unitSuffix}
        </span>
        <span className="font-mono typography-meta text-muted-foreground">{percent}%</span>
      </div>
      <Progress value={percent} state={state} aria-label={`${label}: ${percent}% used`} />
    </div>
  );
}

interface TierSummaryStripProps {
  sandboxesUsed: number;
  sandboxesLimit: number;
  resourcesUsed: number;
  resourcesLimit: number;
  ramUsedGb: number;
  ramLimitGb: number;
  className?: string;
}

export function TierSummaryStrip({
  sandboxesUsed,
  sandboxesLimit,
  resourcesUsed,
  resourcesLimit,
  ramUsedGb,
  ramLimitGb,
  className,
}: TierSummaryStripProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-3", className)}>
      <SummaryTile
        label="Sandboxes (concurrent)"
        used={sandboxesUsed}
        limit={sandboxesLimit}
      />
      <SummaryTile
        label="Agents / MCP Servers / Batch Jobs"
        used={resourcesUsed}
        limit={resourcesLimit}
      />
      <SummaryTile
        label="Concurrent RAM (Batch Jobs)"
        used={ramUsedGb}
        limit={ramLimitGb}
        unit="GB"
      />
    </div>
  );
}
