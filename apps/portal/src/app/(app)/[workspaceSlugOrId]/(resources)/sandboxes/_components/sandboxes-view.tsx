"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { sandboxQueries } from "@/lib/query/sandboxes";
import type { Sandbox } from "@/lib/mock/sandboxes";
import { SandboxesList } from "./sandboxes-list";
import { SandboxesErrorBand } from "./sandboxes-error-band";
import { SandboxesTableSkeleton } from "./sandboxes-table-skeleton";

// Dev simulation harness — `?state=loading|error|empty` overrides the live
// fetch state so each wireframe state can be visually verified without
// touching mock fixtures. Mirrors the policies-view pattern.
type StateSim = "loading" | "error" | "empty" | null;
function readStateSim(value: string | null): StateSim {
  if (value === "loading" || value === "error" || value === "empty") return value;
  return null;
}

export function SandboxesView() {
  const { accountId, workspaceId } = useCurrentTenancy();
  const params = useParams<{ workspaceSlugOrId: string }>();
  const searchParams = useSearchParams();
  const stateSim = readStateSim(searchParams.get("state"));
  const createHref = `/${params.workspaceSlugOrId}/sandboxes/new`;

  const query = useQuery({
    ...sandboxQueries.list(accountId, workspaceId),
    enabled: stateSim !== "loading" && stateSim !== "error",
  });

  let body: React.ReactNode;
  if (stateSim === "loading" || query.isPending) {
    body = <SandboxesTableSkeleton />;
  } else if (stateSim === "error" || query.isError) {
    body = <SandboxesErrorBand onRetry={() => query.refetch()} />;
  } else {
    const sandboxes = (
      stateSim === "empty" ? [] : query.data ?? []
    ) as ReadonlyArray<Sandbox>;
    body = (
      <SandboxesList
        sandboxes={sandboxes}
        workspaceSlug={params.workspaceSlugOrId}
        createHref={createHref}
      />
    );
  }

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="flex items-start justify-between gap-4">
          <h1 className="typography-display font-semibold text-foreground">
            Sandboxes
          </h1>
          <Button asChild variant="primary">
            <Link href={createHref}>
              <Plus aria-hidden="true" />
              Create Sandbox
            </Link>
          </Button>
        </div>
      </header>
      {body}
    </div>
  );
}
