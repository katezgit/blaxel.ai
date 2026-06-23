"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import type { CustomDomain } from "@/lib/mock/custom-domains";
import { formatRelative } from "../../_lib/relative-time";
import { DomainStatusBadge } from "../../_components/status-badge";
import { DeleteDomainDialog } from "./delete-domain-dialog";

interface DetailHeaderProps {
  domain: CustomDomain;
}

export function DetailHeader({ domain }: DetailHeaderProps) {
  const { metadata, spec } = domain;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const showRetry = spec.status === "pending" || spec.status === "failed";

  const handleRetry = async () => {
    setIsRetrying(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsRetrying(false);
    toast.success(`Verification retry triggered for ${metadata.name}`);
  };

  return (
    <header className="page-header">
      <div className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="truncate font-mono typography-display font-semibold text-foreground">
              {metadata.name}
            </h1>
            <DomainStatusBadge status={spec.status} prominentOnFailure />
          </div>
          {metadata.displayName && (
            <p className="typography-body text-muted-foreground">
              {metadata.displayName}
            </p>
          )}
          <p className="page-header-meta">
            <span>
              <span className="text-muted-foreground">region:</span>{" "}
              <span className="font-mono text-foreground">{spec.region}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              created {new Date(metadata.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} by{" "}
              <span className="text-foreground">{metadata.createdBy}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              last verified:{" "}
              <span className="text-foreground">{formatRelative(spec.lastVerifiedAt)}</span>
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {showRetry && (
            <Button
              variant="secondary"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? "Retrying…" : "Retry verification"}
            </Button>
          )}
          <Button variant="destructive-ghost" onClick={() => setDeleteOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <DeleteDomainDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        domainName={metadata.name}
      />
    </header>
  );
}
