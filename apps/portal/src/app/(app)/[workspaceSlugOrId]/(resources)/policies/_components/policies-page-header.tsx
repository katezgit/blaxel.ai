import Link from "next/link";
import { ArrowUpRightIcon, Plus } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";

interface PoliciesPageHeaderProps {
  /** Href the `+ Create Policy` action navigates to. Omit to hide the CTA (Tier-1-locked state). */
  createHref?: string;
  /** When true, surfaces a Tier-1 badge next to the heading. */
  tierLocked?: boolean;
}

export function PoliciesPageHeader({ createHref, tierLocked = false }: PoliciesPageHeaderProps) {
  return (
    <header className="page-header">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="typography-display font-semibold text-foreground">
            Policies
          </h1>
          {tierLocked && (
            <Badge variant="neutral" size="sm">
              Tier 1
            </Badge>
          )}
        </div>
        {createHref && (
          <Button asChild variant="primary">
            <Link href={createHref}>
              <Plus aria-hidden="true" />
              Create Policy
            </Link>
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
