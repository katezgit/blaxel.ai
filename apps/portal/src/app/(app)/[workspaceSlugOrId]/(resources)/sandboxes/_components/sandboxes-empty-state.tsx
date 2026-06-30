"use client";

import Link from "next/link";
import { Box } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { CodeBlock } from "@repo/ui/components/code-block";
import { EmptyState } from "@repo/ui/components/empty-state";

interface SandboxesEmptyStateProps {
  createHref: string;
}

const CLI_SNIPPET = [
  "$ bl sandbox create --name my-sandbox --image blaxel/base",
  "",
  "# SDK:",
  "await SandboxInstance.createIfNotExists({",
  '  name: "my-sandbox",',
  '  image: "blaxel/base",',
  "});",
].join("\n");

/**
 * Sandboxes list empty state. EmptyState (icon + title) leads; the CLI
 * snippet and "Create from console" affordance render beneath as the
 * actionable layer — Alex's primary path is the terminal (personality.md
 * Sacrificial choice #5), so the CLI block stays prominent under the
 * canonical icon-led identification.
 */
export function SandboxesEmptyState({ createHref }: SandboxesEmptyStateProps) {
  return (
    <div className="rounded-md border border-border bg-card px-6 py-12">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6">
        <EmptyState
          variant="zero-state"
          icon={Box}
          title="No Sandboxes in this workspace"
          subtitle="Spin one up from the CLI or from the console."
          className="py-0 px-0"
        />
        <div className="w-full">
          <CodeBlock
            variant="block"
            language="bash"
            code={CLI_SNIPPET}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-3 typography-body text-muted-foreground">
          <span>Or</span>
          <Button asChild variant="secondary">
            <Link href={createHref}>Create from console</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
