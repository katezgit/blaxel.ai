"use client";

import type { ReactNode } from "react";
import type { Sandbox } from "@/lib/mock/sandboxes";
import BandFrame from "./band-frame";

interface SandboxProvenanceBandProps {
  sandbox: Sandbox;
  className?: string;
}

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

export default function SandboxProvenanceBand({
  sandbox,
  className,
}: SandboxProvenanceBandProps) {
  const { metadata, lastUsedAt } = sandbox;
  return (
    <BandFrame label="Provenance" className={className}>
      <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-[160px_1fr]">
        <ProvenanceRow label="Name">
          <span className="font-mono typography-body text-foreground">
            {metadata.name}
          </span>
        </ProvenanceRow>
        <ProvenanceRow label="External ID">
          <span className="font-mono typography-body text-foreground">
            {metadata.externalId}
          </span>
        </ProvenanceRow>
        <ProvenanceRow label="Workspace">
          <span className="font-mono typography-body text-foreground">
            {metadata.workspace}
          </span>
        </ProvenanceRow>
        <ProvenanceRow label="Created">
          <span className="typography-body text-foreground">
            {TIMESTAMP_FMT.format(new Date(metadata.createdAt))}
          </span>
        </ProvenanceRow>
        <ProvenanceRow label="Last used">
          {lastUsedAt ? (
            <span className="typography-body text-foreground">
              {TIMESTAMP_FMT.format(new Date(lastUsedAt))}
            </span>
          ) : (
            <span className="typography-body text-muted-foreground">Never</span>
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
