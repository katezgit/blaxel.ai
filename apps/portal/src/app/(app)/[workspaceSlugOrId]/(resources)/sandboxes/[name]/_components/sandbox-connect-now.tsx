"use client";

import { Keyboard } from "lucide-react";
import { CopyButton } from "@repo/ui/components/copy-button";
import type { Sandbox } from "@/lib/mock/sandboxes";

interface SandboxConnectNowProps {
  sandbox: Sandbox;
}

/** Tier-1 affordance for the Phase 4 canonical operating pattern (wireframe
 * §1.3). The full §1.5 connection-methods band is Phase 2 — this is the
 * one-line copy operator can act on without scrolling.
 *
 * Visible during Deploying with a "not yet reachable" caption (Q11 — copy
 * the command in advance). Hidden when state is Terminated; the parent
 * decides not to render this. */
export default function SandboxConnectNow({ sandbox }: SandboxConnectNowProps) {
  const command = `bl connect sandbox ${sandbox.metadata.name}`;
  const isDeploying = sandbox.status === "DEPLOYING";
  return (
    <section
      aria-label="Connect now"
      className="flex flex-col gap-2 border-t border-border pt-6"
    >
      <div className="flex items-center gap-2 typography-meta text-meta-foreground">
        <Keyboard aria-hidden="true" className="size-3.5" />
        <span>Connect now</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted-surface px-3 py-2">
        <code className="min-w-0 flex-1 overflow-x-auto whitespace-pre font-mono typography-code text-foreground">
          {command}
        </code>
        <CopyButton value={command} ariaLabel={`Copy: ${command}`} />
      </div>
      {isDeploying && (
        <p className="typography-meta text-meta-foreground">
          Not yet reachable — command copies anyway.
        </p>
      )}
    </section>
  );
}
