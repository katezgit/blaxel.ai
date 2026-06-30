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
import SandboxConnectNow from "./sandbox-connect-now";
import SandboxDetailHeader from "./sandbox-detail-header";
import SandboxDetailSkeleton from "./sandbox-detail-skeleton";
import SandboxFailureCard from "./sandbox-failure-card";
import SandboxProvenanceBand from "./sandbox-provenance-band";
import SandboxVitalsStrip from "./sandbox-vitals-strip";

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
        <SandboxDetailErrorHeader
          sandboxName={sandboxName}
          listHref={listHref}
          onRetry={() => sandboxQuery.refetch()}
        />
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

  const isErrored = sandbox.status === "FAILED";
  const showConnectNow = sandbox.status !== "TERMINATED" && sandbox.status !== "DELETING";

  return (
    <div className="page-shell">
      <SandboxDetailHeader sandbox={sandbox} workspaceSlug={workspaceSlug} />
      {isErrored && <SandboxFailureCard sandbox={sandbox} />}
      <SandboxProvenanceBand sandbox={sandbox} />
      {showConnectNow && <SandboxConnectNow sandbox={sandbox} />}
      <SandboxVitalsStrip sandbox={sandbox} />
    </div>
  );
}

interface SandboxDetailErrorHeaderProps {
  sandboxName: string;
  listHref: string;
  onRetry: () => void;
}

/** API-error shape per wireframe §2.8 — heading reverts to index-page form:
 * h1 + right-edge Retry, description below at gap-1. No meta row. Outer
 * header keeps `gap-3 pt-2 pb-6` for parity with the populated header. */
function SandboxDetailErrorHeader({
  sandboxName,
  listHref,
  onRetry,
}: SandboxDetailErrorHeaderProps) {
  return (
    <>
      <header className="flex flex-col gap-3 pt-2 pb-6">
        <Breadcrumb
          parent={{ href: listHref, label: "Sandboxes" }}
          current={sandboxName}
        />
        <div className="flex min-w-0 flex-col page-header">
          <div className="flex items-center justify-between gap-2">
            <h1 className="typography-display font-semibold text-foreground">
              Failed to load Sandbox
            </h1>
            <Button type="button" variant="primary" onClick={onRetry}>
              Retry
            </Button>
          </div>
          <p className="typography-body text-muted-foreground">
            The Sandbox{" "}
            <code className="font-mono text-foreground">{sandboxName}</code>{" "}
            could not be loaded. Network or API error.
          </p>
        </div>
      </header>
      <p>
        <Button asChild variant="ghost">
          <Link href={listHref}>
            <ArrowLeft aria-hidden="true" />
            Back to Sandboxes
          </Link>
        </Button>
      </p>
    </>
  );
}
