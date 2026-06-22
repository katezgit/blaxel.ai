import { TriangleAlert } from "lucide-react";
import { Progress } from "@repo/ui/components/progress";
import { cn } from "@repo/ui/lib/cn";
import InlineGate from "@/app/(account)/account/_components/inline-gate";

interface UtilizedRowProps {
  label: string;
  used: number;
  limit: number;
  unit?: string;
}

/**
 * Color encoding rule (wireframe Region C anti-pattern check + Plan & Quotas
 * Region B "progress bar color encoding"): neutral below 70%, warning at
 * 70-89%, critical at 90%+. Lives at app-level because thresholds are
 * Blaxel-domain decisions, not generic DS state.
 */
function progressStateFor(percent: number): "neutral" | "warning" | "error" {
  if (percent >= 90) return "error";
  if (percent >= 70) return "warning";
  return "neutral";
}

export function UtilizedQuotaRow({ label, used, limit, unit }: UtilizedRowProps) {
  const percent = limit > 0 ? Math.round((used / limit) * 100) : 0;
  const state = progressStateFor(percent);
  const atLimit = percent >= 100;
  const unitSuffix = unit ? ` ${unit}` : "";

  return (
    <div className="flex flex-col gap-1.5 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="typography-body text-foreground">{label}</span>
        <div className="flex items-center gap-2 font-mono typography-meta tabular-nums text-foreground">
          {atLimit ? (
            <>
              <TriangleAlert
                className="size-3.5 text-state-errored"
                aria-hidden="true"
              />
              <span className="sr-only">At limit. </span>
            </>
          ) : null}
          <span>
            {used} / {limit}
            {unitSuffix}
          </span>
        </div>
      </div>
      <Progress value={percent} state={state} aria-label={`${label}: ${percent}% used`} />
    </div>
  );
}

interface CeilingRowProps {
  label: string;
  value: string;
}

export function CeilingQuotaRow({ label, value }: CeilingRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-3">
      <span className="typography-body text-foreground">{label}</span>
      <span className="font-mono typography-meta tabular-nums text-muted-foreground">
        {value} <span className="ml-1 text-meta-foreground">(tier ceiling)</span>
      </span>
    </div>
  );
}

interface GatedRowProps {
  label: string;
  tier: number;
  verb: string;
  contactSales?: boolean;
}

export function GatedQuotaRow({ label, tier, verb, contactSales }: GatedRowProps) {
  return (
    <div className="flex flex-col gap-1.5 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="typography-body text-foreground">{label}</span>
        <span className="font-mono typography-meta text-muted-foreground">Not included</span>
      </div>
      {contactSales ? (
        <p className="typography-caption text-muted-foreground">
          Tier {tier} required &mdash; contact us for upgrade options.{" "}
          <a
            href="mailto:sales@blaxel.ai"
            className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline focus-visible:shadow-focus-ring rounded-sm"
          >
            Contact us
          </a>
        </p>
      ) : (
        <InlineGate tier={tier} verb={verb} />
      )}
    </div>
  );
}

interface QuotaGroupProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function QuotaGroup({ label, children, className }: QuotaGroupProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card",
        className,
      )}
    >
      <header className="border-b border-border px-4 py-2">
        <h2 className="font-mono typography-meta uppercase text-meta-foreground">
          {label}
        </h2>
      </header>
      <div className="divide-y divide-border px-4">{children}</div>
    </section>
  );
}
