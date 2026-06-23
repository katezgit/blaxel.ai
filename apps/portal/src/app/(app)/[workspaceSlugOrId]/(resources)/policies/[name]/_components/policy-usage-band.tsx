"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import { Button } from "@repo/ui/components/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { CopyButton } from "@repo/ui/components/copy-button";
import { BandFrame } from "./band-frame";
import type {
  Policy,
  PolicyUsageCounts,
  PolicyUsageWorkload,
  PolicyUsages,
} from "@/lib/mock/policies";
import { totalUsage } from "@/lib/mock/policies";

interface PolicyUsageBandProps {
  policy: Policy;
  usages: PolicyUsages | null;
  workspaceSlug: string;
  onRequestDelete: () => void;
}

interface KindRow {
  key: keyof PolicyUsageCounts;
  label: string;
  /** Workload route segment for linking out to the workload's detail page. */
  routeSegment: string;
}

const KIND_ROWS: ReadonlyArray<KindRow> = [
  { key: "agents", label: "Agents", routeSegment: "agents" },
  { key: "models", label: "Model APIs", routeSegment: "model-apis" },
  { key: "functions", label: "MCP Servers", routeSegment: "mcp-servers" },
  { key: "jobs", label: "Jobs", routeSegment: "jobs" },
  { key: "sandboxes", label: "Sandboxes", routeSegment: "sandboxes" },
];

export function PolicyUsageBand({
  policy,
  usages,
  workspaceSlug,
  onRequestDelete,
}: PolicyUsageBandProps) {
  const total = totalUsage(policy.usage);

  if (total === 0) {
    const deleteCommand = `bl policy delete ${policy.metadata.name}`;
    return (
      <BandFrame label="Usage">
        <div className="flex flex-col items-start gap-3 rounded-md border border-border bg-background px-5 py-5">
          <h3 className="typography-label font-medium text-foreground">
            No workloads reference this policy.
          </h3>
          <p className="typography-body text-muted-foreground">
            Safe to delete — no attached workloads will be affected.
          </p>
          <div className="group flex items-center gap-1 rounded-md">
            <code className="font-mono typography-body text-foreground">
              {deleteCommand}
            </code>
            <span className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <CopyButton value={deleteCommand} tooltipLabel="Copy command" />
            </span>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={onRequestDelete}
          >
            <Trash2 aria-hidden="true" />
            Delete policy
          </Button>
        </div>
      </BandFrame>
    );
  }

  return (
    <BandFrame label="Usage">
      <div className="flex flex-col gap-2 rounded-md border border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <h3 className="typography-label font-medium text-foreground">
            Workloads referencing this policy
          </h3>
          <span className="font-mono typography-meta text-meta-foreground">
            Policy.usage
          </span>
        </div>
        <ul className="divide-y divide-border">
          {KIND_ROWS.map((row) => (
            <KindUsageRow
              key={row.key}
              row={row}
              count={policy.usage[row.key]}
              workloads={usages?.[row.key] ?? []}
              workspaceSlug={workspaceSlug}
            />
          ))}
        </ul>
      </div>
    </BandFrame>
  );
}

interface KindUsageRowProps {
  row: KindRow;
  count: number;
  workloads: ReadonlyArray<PolicyUsageWorkload>;
  workspaceSlug: string;
}

function KindUsageRow({ row, count, workloads, workspaceSlug }: KindUsageRowProps) {
  const [open, setOpen] = useState(false);
  const muted = count === 0;
  const expandable = count > 0 && workloads.length > 0;

  if (!expandable) {
    return (
      <li
        className={cn(
          "grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3",
          muted && "text-muted-foreground",
        )}
      >
        <span className="typography-body">{row.label}</span>
        <span className="font-mono typography-body tabular-nums">{count}</span>
      </li>
    );
  }

  return (
    <li>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-hover-surface"
            aria-expanded={open}
          >
            {open ? (
              <ChevronDown aria-hidden="true" className="size-4 text-muted-foreground" />
            ) : (
              <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground" />
            )}
            <span className="typography-body text-foreground">{row.label}</span>
            <span className="font-mono typography-body tabular-nums text-foreground">
              {count}
            </span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="border-t border-border bg-card">
            {workloads.map((workload) => (
              <li
                key={workload.name}
                className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <Link
                  href={`/${workspaceSlug}/${row.routeSegment}`}
                  className="font-mono typography-body text-foreground hover:text-primary hover:underline"
                >
                  {workload.name}
                </Link>
                {workload.peerPolicies.length > 0 && (
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="typography-meta text-muted-foreground">
                      Also attaches:
                    </span>
                    {workload.peerPolicies.map((peer) => (
                      <Link
                        key={peer}
                        href={`/${workspaceSlug}/policies/${peer}`}
                        className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 font-mono typography-meta text-muted-foreground hover:border-border-strong hover:text-foreground"
                      >
                        {peer}
                      </Link>
                    ))}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}
