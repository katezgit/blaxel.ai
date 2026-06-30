"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Breadcrumb } from "@/components/shell/breadcrumb";
import ResourceNotFound from "@/components/shell/resource-not-found";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { sandboxQueries } from "@/lib/query/sandboxes";
import SandboxDetailHeader from "./sandbox-detail-header";
import SandboxDetailSkeleton from "./sandbox-detail-skeleton";
import SandboxEventsBand from "./sandbox-events-band";
import SandboxProvenanceBand from "./sandbox-provenance-band";
import SandboxSpecBand from "./sandbox-spec-band";

interface SandboxDetailViewProps {
  workspaceSlug: string;
  sandboxName: string;
}

type StateSim = "loading" | "error" | null;
function readStateSim(value: string | null): StateSim {
  return value === "loading" || value === "error" ? value : null;
}

export default function SandboxDetailView({
  workspaceSlug,
  sandboxName,
}: SandboxDetailViewProps) {
  const { accountId, workspaceId } = useCurrentTenancy();
  const searchParams = useSearchParams();
  const stateSim = readStateSim(searchParams.get("state"));
  const listHref = `/${workspaceSlug}/sandboxes`;
  const sandboxQuery = useQuery({
    ...sandboxQueries.detail(accountId, workspaceId, sandboxName),
    enabled: stateSim === null,
  });

  if (stateSim === "loading" || sandboxQuery.isPending) {
    return (
      <div className="page-shell">
        <SandboxDetailSkeleton workspaceSlug={workspaceSlug} />
      </div>
    );
  }

  if (stateSim === "error" || sandboxQuery.isError) {
    return (
      <div className="page-shell">
        <Breadcrumb
          parent={{ href: listHref, label: "Sandboxes" }}
          current={sandboxName}
        />
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-border bg-card px-6 py-8"
        >
          <h2 className="typography-subtitle font-semibold text-foreground">
            Sandbox unavailable
          </h2>
          <p className="mt-1 typography-body text-muted-foreground">
            Could not load{" "}
            <code className="font-mono">{sandboxName}</code>. Retry below or
            return to the list.
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              variant="primary"
              type="button"
              onClick={() => sandboxQuery.refetch()}
            >
              Retry
            </Button>
            <Button asChild variant="ghost">
              <Link href={listHref}>
                <ArrowLeft aria-hidden="true" />
                Back to Sandboxes
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const sandbox = sandboxQuery.data;
  if (sandbox == null) {
    return (
      <div className="page-shell min-h-full">
        <Breadcrumb
          parent={{ href: listHref, label: "Sandboxes" }}
          current={sandboxName}
        />
        <ResourceNotFound
          resourceLabel="Sandbox"
          resourceTypeSlug="sandboxes"
          id={sandboxName}
          supportingLine="This sandbox isn't available in this workspace."
          listHref={listHref}
          listLabel="Go to Sandboxes"
        />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <SandboxDetailHeader sandbox={sandbox} workspaceSlug={workspaceSlug} />
      <SandboxSpecBand sandbox={sandbox} className="border-t-0 pt-0" />
      <SandboxProvenanceBand sandbox={sandbox} />
      <SandboxEventsBand sandbox={sandbox} />
    </div>
  );
}
