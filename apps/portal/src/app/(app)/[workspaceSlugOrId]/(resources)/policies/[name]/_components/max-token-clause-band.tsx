"use client";

import { Pencil } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import BandFrame from "./band-frame";
import type { PolicyMaxTokens } from "@/lib/mock/policies";

interface MaxTokenClauseBandProps {
  maxTokens: PolicyMaxTokens | null;
  onRequestEdit: () => void;
  className?: string;
}

const NUMBER_FMT = new Intl.NumberFormat("en-US");

export default function MaxTokenClauseBand({
  maxTokens,
  onRequestEdit,
  className,
}: MaxTokenClauseBandProps) {
  if (maxTokens === null) {
    return (
      <BandFrame label="Token limits" className={className}>
        <p className="typography-body text-muted-foreground">
          No token limits configured. Edit to add caps.
        </p>
      </BandFrame>
    );
  }

  const windowLabel =
    maxTokens.step === 1
      ? maxTokens.granularity
      : `${maxTokens.step} ${maxTokens.granularity}s`;

  return (
    <BandFrame
      label={`Token limits per ${windowLabel}`}
      className={className}
      action={
        <Button
          type="button"
          variant="ghost"
          onClick={onRequestEdit}
          className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Pencil aria-hidden="true" />
          Edit
        </Button>
      }
    >
      <dl className="divide-y divide-border rounded-md border border-border bg-background">
        <ThresholdRow label="Input tokens" value={maxTokens.input} />
        <ThresholdRow label="Output tokens" value={maxTokens.output} />
        <ThresholdRow label="Total tokens" value={maxTokens.total} />
        <ThresholdRow
          label="Input / output ratio cap"
          value={maxTokens.ratioInputOverOutput}
        />
      </dl>
      <p className="typography-caption text-muted-foreground">
        Live consumption data — see workload metrics for attached Agents and
        Model APIs.
      </p>
    </BandFrame>
  );
}

interface ThresholdRowProps {
  label: string;
  value: number;
}

function ThresholdRow({ label, value }: ThresholdRowProps) {
  const notEvaluated = value === 0;
  return (
    <div className="grid grid-cols-1 items-center gap-1 px-4 py-3 sm:grid-cols-[1fr_auto]">
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
    </div>
  );
}

