"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Panel } from "@/app/(manage)/_components/page-primitives";
import { useAccountState } from "@/lib/mock/account-context";

export function WorkspacesSummarySection() {
  const { state } = useAccountState();
  const count = state.workspaces.length;

  return (
    <Panel
      title="Workspaces"
      action={
        <Button asChild variant="ghost">
          <Link href="/account/workspaces">
            View workspaces
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      }
    >
      <dl className="grid max-w-[720px] grid-cols-[180px_minmax(0,1fr)] gap-x-8 gap-y-4 text-body">
        <dt className="text-muted-foreground">Workspace count</dt>
        <dd className="text-foreground">{count}</dd>

        <dt className="text-muted-foreground">Resource scope</dt>
        <dd className="text-foreground">
          Sandboxes, agents, and policies are scoped to workspaces.
        </dd>
      </dl>
    </Panel>
  );
}
