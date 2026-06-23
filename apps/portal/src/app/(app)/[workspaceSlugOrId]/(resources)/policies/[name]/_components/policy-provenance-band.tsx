"use client";

import { BandFrame } from "./band-frame";
import type { PolicyMetadata } from "@/lib/mock/policies";

const TIMESTAMP_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
  timeZoneName: "short",
});

interface PolicyProvenanceBandProps {
  metadata: PolicyMetadata;
}

export function PolicyProvenanceBand({ metadata }: PolicyProvenanceBandProps) {
  const labelEntries = Object.entries(metadata.labels);
  return (
    <BandFrame label="Provenance">
      <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-[140px_1fr]">
        <TimestampRow
          label="Created"
          timestamp={metadata.createdAt}
          actor={metadata.createdBy}
          field="metadata.createdAt"
        />
        <TimestampRow
          label="Last updated"
          timestamp={metadata.updatedAt}
          actor={metadata.updatedBy}
          field="metadata.updatedAt"
        />
        <KvRow label="Workspace" field="metadata.workspace">
          <span className="font-mono typography-body text-foreground">
            {metadata.workspace}
          </span>
        </KvRow>
        <KvRow label="Labels" field="metadata.labels[]">
          {labelEntries.length === 0 ? (
            <span className="typography-body text-muted-foreground">(none)</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {labelEntries.map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 font-mono typography-meta text-foreground"
                >
                  <span className="text-muted-foreground">{key}:</span>
                  {value}
                </span>
              ))}
            </div>
          )}
        </KvRow>
      </dl>
    </BandFrame>
  );
}

interface TimestampRowProps {
  label: string;
  timestamp: string;
  actor: string;
  field: string;
}

function TimestampRow({ label, timestamp, actor, field }: TimestampRowProps) {
  return (
    <>
      <dt className="typography-label font-medium text-muted-foreground">{label}</dt>
      <dd className="flex flex-col gap-1">
        <span className="font-mono typography-body text-foreground">
          {TIMESTAMP_FMT.format(new Date(timestamp))}
        </span>
        <span className="typography-body text-muted-foreground">
          by <span className="font-mono">{actor}</span>
        </span>
        <span className="font-mono typography-meta text-meta-foreground">
          {field}
        </span>
      </dd>
    </>
  );
}

function KvRow({
  label,
  field,
  children,
}: {
  label: string;
  field: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="typography-label font-medium text-muted-foreground">{label}</dt>
      <dd className="flex flex-col gap-1">
        {children}
        <span className="font-mono typography-meta text-meta-foreground">
          {field}
        </span>
      </dd>
    </>
  );
}
