"use client";

import { CodeBlock } from "@repo/ui/components/code-block";
import { Button } from "@repo/ui/components/button";
import { Plus } from "lucide-react";

interface PoliciesEmptyStateProps {
  onCreate: () => void;
}

export function PoliciesEmptyState({ onCreate }: PoliciesEmptyStateProps) {
  return (
    <section
      aria-labelledby="policies-empty-heading"
      className="flex flex-col items-start gap-4 rounded-lg border border-border bg-card px-6 py-10"
    >
      <h2
        id="policies-empty-heading"
        className="typography-subtitle font-semibold text-foreground"
      >
        No Policies in this workspace.
      </h2>
      <p className="typography-body text-muted-foreground">
        Create a policy from the dashboard, or apply a YAML manifest from the
        command line.
      </p>
      <div className="w-full max-w-xl">
        <CodeBlock variant="block" code="bl apply -f policy.yaml" />
      </div>
      <Button variant="primary" onClick={onCreate}>
        <Plus aria-hidden="true" />
        Create Policy
      </Button>
    </section>
  );
}
