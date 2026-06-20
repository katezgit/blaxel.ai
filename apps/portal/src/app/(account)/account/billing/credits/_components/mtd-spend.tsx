"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MtdSpendProps {
  monthLabel: string;
  totalUsd: number;
}

const formatUsd = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

export function MtdSpend({ monthLabel, totalUsd }: MtdSpendProps) {
  const [expanded, setExpanded] = useState(false);
  const panelId = "mtd-spend-breakdown";
  return (
    <section className="rounded-lg border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
        <h2 className="text-body font-semibold text-foreground">
          Month-to-date spend
        </h2>
        <span className="font-mono text-meta text-muted-foreground">
          {monthLabel}
        </span>
      </header>
      <div className="flex flex-col gap-3 px-6 py-4">
        <p className="font-mono text-display font-semibold tabular-nums text-foreground">
          {formatUsd(totalUsd)}{" "}
          <span className="text-meta font-normal text-muted-foreground">
            total this month
          </span>
        </p>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="inline-flex w-fit items-center gap-1 rounded-sm text-body text-muted-foreground hover:text-foreground hover:underline focus-visible:shadow-focus-ring"
        >
          {expanded ? (
            <ChevronUp className="size-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="size-4" aria-hidden="true" />
          )}
          {expanded ? "Collapse breakdown" : "Expand breakdown"}
        </button>
      </div>
      {expanded ? (
        <div id={panelId} className="border-t border-border px-6 py-4">
          <div className="rounded-md border border-dashed border-border bg-muted-surface px-4 py-8 text-center">
            {totalUsd > 0 ? (
              <p className="text-body text-foreground">
                Total expense{" "}
                <span className="font-mono font-semibold tabular-nums">
                  {formatUsd(totalUsd)}
                </span>
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-body text-foreground">
                  No billing data for {monthLabel}.
                </p>
                <p className="text-caption text-muted-foreground">
                  Usage will appear here once a Workspace resource (Sandbox,
                  Agent, Batch Job, MCP Server, Volume, Custom domain) generates
                  a billable event.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
