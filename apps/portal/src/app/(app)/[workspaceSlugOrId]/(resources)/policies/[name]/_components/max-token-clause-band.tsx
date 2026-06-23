"use client";

import { BandFrame } from "./band-frame";
import type { PolicyMaxTokens } from "@/lib/mock/policies";

interface MaxTokenClauseBandProps {
  maxTokens: PolicyMaxTokens | null;
}

const NUMBER_FMT = new Intl.NumberFormat("en-US");

export function MaxTokenClauseBand({ maxTokens }: MaxTokenClauseBandProps) {
  if (maxTokens === null) {
    return (
      <BandFrame label="Clause">
        <p className="typography-body text-muted-foreground">
          No token limits configured. Edit to add caps.
        </p>
      </BandFrame>
    );
  }

  const windowLabel =
    maxTokens.step === 1
      ? capitalize(maxTokens.granularity)
      : `${maxTokens.step} ${maxTokens.granularity}s`;

  return (
    <BandFrame label="Clause">
      <div className="flex flex-col gap-4">
        <p className="typography-body text-foreground">
          <span className="font-medium">Type:</span> maxToken
        </p>
        <p className="typography-body text-muted-foreground">
          Token consumption for attached workloads is capped per window.
          Requests exceeding the cap receive 429. All subsequent requests
          within the window are dropped.
        </p>

        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="typography-label font-medium text-foreground">
              Window
            </h3>
            <span className="font-mono typography-meta text-meta-foreground">
              spec.maxTokens.granularity + step
            </span>
          </div>
          <p className="typography-body text-foreground">
            <span className="font-mono">{windowLabel}</span>
            <span className="ml-3 font-mono typography-meta text-muted-foreground">
              granularity: {maxTokens.granularity} / step: {maxTokens.step}
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="typography-label font-medium text-foreground">
              Token limits
            </h3>
            <span className="font-mono typography-meta text-meta-foreground">
              spec.maxTokens.*
            </span>
          </div>
          <dl className="divide-y divide-border rounded-md border border-border bg-background">
            <ThresholdRow
              label="Input tokens per window"
              field="spec.maxTokens.input"
              value={maxTokens.input}
            />
            <ThresholdRow
              label="Output tokens per window"
              field="spec.maxTokens.output"
              value={maxTokens.output}
            />
            <ThresholdRow
              label="Total tokens per window"
              field="spec.maxTokens.total"
              value={maxTokens.total}
            />
            <ThresholdRow
              label="Input / output ratio cap"
              field="spec.maxTokens.ratioInputOverOutput"
              value={maxTokens.ratioInputOverOutput}
            />
          </dl>
        </div>

        <p className="typography-caption text-muted-foreground">
          Live consumption data — see workload metrics for attached Agents and
          Model APIs.
        </p>
      </div>
    </BandFrame>
  );
}

interface ThresholdRowProps {
  label: string;
  field: string;
  value: number;
}

function ThresholdRow({ label, field, value }: ThresholdRowProps) {
  const notEvaluated = value === 0;
  return (
    <div className="grid grid-cols-1 items-center gap-1 px-4 py-3 sm:grid-cols-[1fr_auto_auto]">
      <dt className="typography-body text-foreground">{label}</dt>
      <dd
        className={
          notEvaluated
            ? "font-mono typography-body tabular-nums text-muted-foreground"
            : "font-mono typography-body tabular-nums text-foreground"
        }
      >
        {notEvaluated ? "Not evaluated" : NUMBER_FMT.format(value)}
      </dd>
      <span className="font-mono typography-meta text-meta-foreground sm:ml-3">
        {field}
        {notEvaluated && " = 0"}
      </span>
    </div>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
