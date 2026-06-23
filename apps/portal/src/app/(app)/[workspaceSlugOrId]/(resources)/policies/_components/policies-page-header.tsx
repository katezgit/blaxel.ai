"use client";

import { ArrowUpRightIcon, Plus } from "lucide-react";
import { Button } from "@repo/ui/components/button";

interface PoliciesPageHeaderProps {
  /** Whether to render the `+ Create Policy` action. Absent in the Tier-1-locked state. */
  showCreate: boolean;
  onCreate?: () => void;
}

export function PoliciesPageHeader({ showCreate, onCreate }: PoliciesPageHeaderProps) {
  return (
    <header className="page-header">
      <div className="flex items-start justify-between gap-4">
        <h1 className="typography-display font-semibold text-foreground">
          Policies
        </h1>
        {showCreate && (
          <Button variant="primary" onClick={onCreate}>
            <Plus aria-hidden="true" />
            Create Policy
          </Button>
        )}
      </div>
      <p className="max-w-2xl text-muted-foreground">
        Define where and how your AI workloads run. Policies control the
        location, hardware flavor, and token usage of Agents, MCP Servers, and
        Model APIs deployed in this workspace.{" "}
        <a
          href="https://docs.blaxel.ai/Model-Governance/Policies"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Policies documentation, opens in new tab"
          className="inline-flex items-baseline gap-0.5 text-muted-foreground hover:text-foreground hover:underline"
        >
          Docs
          <ArrowUpRightIcon aria-hidden="true" className="size-3 self-center" />
        </a>
        {" · "}
        <a
          href="https://docs.blaxel.ai/api-reference/policies"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Policies API reference, opens in new tab"
          className="inline-flex items-baseline gap-0.5 text-muted-foreground hover:text-foreground hover:underline"
        >
          API reference
          <ArrowUpRightIcon aria-hidden="true" className="size-3 self-center" />
        </a>
      </p>
    </header>
  );
}
