"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { CopyButton } from "@repo/ui/components/copy-button";
import { cn } from "@repo/ui/lib/cn";
import type { Sandbox, SandboxProvenance } from "@/lib/mock/sandboxes";
import { formatRelative } from "./format-helpers";

interface SandboxProvenanceBandProps {
  sandbox: Sandbox;
  className?: string;
}

/** Provenance band per wireframe §1.2 — the highest-impact addition vs
 * current production. First thing Alex's eye lands on after the identity
 * row in an incident: "what created these failing instances?"
 *
 * One row, four shapes — Agent / Batch Job / CLI / Dashboard. The shape
 * lives in the discriminated union; this component renders the matching
 * layout per source. */
export default function SandboxProvenanceBand({
  sandbox,
  className,
}: SandboxProvenanceBandProps) {
  return (
    <section
      aria-label="Spawned by"
      className={cn(
        "flex flex-col gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:gap-3",
        className,
      )}
    >
      <span className="typography-meta text-meta-foreground">Spawned by</span>
      <ProvenanceRow provenance={sandbox.provenance} />
    </section>
  );
}

function ProvenanceRow({ provenance }: { provenance: SandboxProvenance }) {
  switch (provenance.source) {
    case "agent":
      return (
        <span className="page-header-meta">
          <ParentTag label="Agent" />
          <Link
            href={provenance.agentHref}
            className="font-mono text-foreground transition-colors hover:text-primary"
          >
            {provenance.agentName}
          </Link>
          <DotSeparator />
          <span className="typography-meta text-meta-foreground">session</span>
          <span className="page-header-meta-group">
            <span className="font-mono typography-meta text-foreground">
              {provenance.sessionId}
            </span>
            <CopyButton
              value={provenance.sessionId}
              ariaLabel={`Copy session ID ${provenance.sessionId}`}
            />
          </span>
          <DotSeparator />
          <RelativeTime iso={provenance.occurredAt} />
        </span>
      );
    case "job":
      return (
        <span className="page-header-meta">
          <ParentTag label="Batch Job" />
          <Link
            href={provenance.jobHref}
            className="font-mono text-foreground transition-colors hover:text-primary"
          >
            {provenance.jobName}
          </Link>
          <DotSeparator />
          <span className="typography-meta text-meta-foreground">
            task {provenance.taskIndex} of {provenance.taskTotal}
          </span>
          <DotSeparator />
          <RelativeTime iso={provenance.occurredAt} />
        </span>
      );
    case "cli":
      return (
        <span className="page-header-meta">
          <ParentTag label="CLI" />
          <span className="font-mono text-foreground">
            {provenance.userEmail}
          </span>
          <DotSeparator />
          <span className="typography-meta text-meta-foreground">
            via <span className="font-mono">{provenance.command}</span>
          </span>
          <DotSeparator />
          <RelativeTime iso={provenance.occurredAt} />
        </span>
      );
    case "dashboard":
      return (
        <span className="page-header-meta">
          <ParentTag label="Dashboard" />
          <span className="font-mono text-foreground">
            {provenance.userEmail}
          </span>
          <DotSeparator />
          <span className="typography-meta text-meta-foreground">
            via <span className="font-mono">{provenance.path}</span>
          </span>
          <DotSeparator />
          <RelativeTime iso={provenance.occurredAt} />
        </span>
      );
  }
}

function ParentTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 typography-body text-foreground">
      <ArrowUp aria-hidden="true" className="size-3.5 text-meta-foreground" />
      {label}
    </span>
  );
}

function DotSeparator() {
  return (
    <span aria-hidden="true" className="text-meta-foreground">
      ·
    </span>
  );
}

function RelativeTime({ iso }: { iso: string }) {
  return (
    <span title={iso} className="typography-meta text-meta-foreground">
      {formatRelative(iso)}
    </span>
  );
}
