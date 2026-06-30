"use client";

import { findSandboxImage } from "@/lib/mock/sandbox-images";
import type { CreateFormState } from "./form-state";

interface SummaryRailProps {
  state: CreateFormState;
}

const TTL_LABEL: Record<CreateFormState["ttl"], string> = {
  none: "No expiry",
  "1d": "1 day",
  "7d": "7 days",
  "30d": "30 days",
};

export function SummaryRail({ state }: SummaryRailProps) {
  const image = state.imageRef ? findSandboxImage(state.imageRef) : undefined;
  const imageLabel = image
    ? `${image.ref}@${image.sha.slice(0, 4)}…`
    : "—";
  return (
    <aside
      aria-labelledby="summary-rail-heading"
      className="flex flex-col gap-4 rounded-md border border-border bg-card p-5"
    >
      <header className="flex flex-col gap-1">
        <h2
          id="summary-rail-heading"
          className="typography-body font-semibold text-foreground"
        >
          Summary
        </h2>
      </header>
      <dl className="flex flex-col gap-3">
        <Row label="Image" value={imageLabel} mono />
        <Row label="Memory" value={`${state.memoryMib} MiB`} />
        <Row label="TTL" value={TTL_LABEL[state.ttl]} />
        <Row label="Region" value={state.region} mono />
        {state.volumes.length > 0 ? (
          <Row
            label="Volumes"
            value={state.volumes.map((v) => v.name).join(", ")}
            mono
          />
        ) : null}
        {state.envVars.length > 0 ? (
          <Row
            label="Env vars"
            value={`${state.envVars.length} variable${state.envVars.length === 1 ? "" : "s"}`}
          />
        ) : null}
      </dl>
    </aside>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="typography-caption text-muted-foreground">{label}</dt>
      <dd
        className={
          mono
            ? "typography-meta font-mono text-foreground"
            : "typography-body text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  );
}
