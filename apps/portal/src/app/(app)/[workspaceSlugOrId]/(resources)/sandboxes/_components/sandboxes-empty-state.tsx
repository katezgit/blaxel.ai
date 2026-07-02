"use client";

import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { CodeBlock } from "@repo/ui/components/code-block";

interface SandboxesEmptyStateProps {
  createHref: string;
}

const CLI_SNIPPET = [
  "$ bl sandbox create --name my-sandbox --image blaxel/base",
  "",
  '# SDK:',
  'await SandboxInstance.createIfNotExists({',
  '  name: "my-sandbox",',
  '  image: "blaxel/base",',
  "});",
].join("\n");

/**
 * Sandboxes list empty state — CLI-first by design. Alex creates Sandboxes
 * from her terminal; the dashboard "Create from console" CTA is
 * intentionally the secondary affordance under the snippet (§1.5 of the
 * wireframe / personality.md Sacrificial choice #5).
 */
export function SandboxesEmptyState({ createHref }: SandboxesEmptyStateProps) {
  return (
    <div className="rounded-md border border-border bg-card px-6 py-12">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <p className="typography-body text-foreground">
          No Sandboxes in this workspace.
        </p>
        <div className="w-full text-left">
          <CodeBlock
            variant="block"
            language="bash"
            code={CLI_SNIPPET}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-3 typography-body text-muted-foreground">
          <span>Or</span>
          <Button asChild variant="ghost">
            <Link href={createHref}>Create from console</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
