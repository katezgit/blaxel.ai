"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Panel } from "@/app/(manage)/_components/page-primitives";
import { useAccountState } from "@/lib/mock/account-context";

export default function WorkspacesSummarySection() {
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
      <dl className="grid max-w-[720px] grid-cols-1 gap-y-3 text-body sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-x-8 sm:gap-y-4">
        <dt className="text-muted-foreground">Workspace count</dt>
        <dd className="text-foreground">{count}</dd>

        <dt className="text-muted-foreground">Resource scope</dt>
        <dd className="text-foreground">
          Resources are scoped to workspaces.
        </dd>
      </dl>
    </Panel>
  );
}
