"use client";

import type { ReactNode } from "react";
import BandFrame from "./band-frame";
import { policyTypeLabel } from "@/lib/mock/policies";
import type { PolicyMetadata, PolicyType } from "@/lib/mock/policies";

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
  policyType: PolicyType;
  className?: string;
}

export default function PolicyProvenanceBand({
  metadata,
  policyType,
  className,
}: PolicyProvenanceBandProps) {
  const labelEntries = Object.entries(metadata.labels);
  return (
    <BandFrame label="Provenance" className={className}>
      <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-[140px_1fr]">
        <ProvenanceRow label="Type">
          <span className="typography-body text-foreground">
            {policyTypeLabel(policyType)}
          </span>
        </ProvenanceRow>
        <ProvenanceRow label="Created">
          <span className="typography-body text-foreground">
            {TIMESTAMP_FMT.format(new Date(metadata.createdAt))}
          </span>
          <span className="typography-body text-muted-foreground">
            {" by "}
            <span className="font-mono">{metadata.createdBy}</span>
          </span>
        </ProvenanceRow>
        <ProvenanceRow label="Last updated">
          <span className="typography-body text-foreground">
            {TIMESTAMP_FMT.format(new Date(metadata.updatedAt))}
          </span>
          <span className="typography-body text-muted-foreground">
            {" by "}
            <span className="font-mono">{metadata.updatedBy}</span>
          </span>
        </ProvenanceRow>
        <ProvenanceRow label="Workspace">
          <span className="font-mono typography-body text-foreground">
            {metadata.workspace}
          </span>
        </ProvenanceRow>
        <ProvenanceRow label="Labels">
          {labelEntries.length === 0 ? (
            <span className="typography-body text-muted-foreground">
              None
            </span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {labelEntries.map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-muted-surface px-2 py-0.5 typography-code text-foreground"
                >
                  <span className="text-muted-foreground">{key}:</span>
                  {value}
                </span>
              ))}
            </div>
          )}
        </ProvenanceRow>
      </dl>
    </BandFrame>
  );
}

interface ProvenanceRowProps {
  label: string;
  children: ReactNode;
}

function ProvenanceRow({ label, children }: ProvenanceRowProps) {
  return (
    <>
      <dt className="typography-body font-medium text-muted-foreground">
        {label}
      </dt>
      <dd className="flex flex-wrap items-baseline gap-x-1">{children}</dd>
    </>
  );
}
