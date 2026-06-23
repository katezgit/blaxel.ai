"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import type { CustomDomain } from "@/lib/mock/custom-domains";
import { formatRelative } from "../../_lib/relative-time";
import { DomainStatusBadge } from "../../_components/status-badge";
import { Band } from "./band";

interface VerificationBandProps {
  domain: CustomDomain;
}

export function VerificationBand({ domain }: VerificationBandProps) {
  const { metadata, spec } = domain;
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsRetrying(false);
    toast.success(`Verification retry triggered for ${metadata.name}`);
  };

  return (
    <Band title="Verification" elevated={spec.status === "failed"}>
      <dl className="grid grid-cols-[120px_1fr] gap-x-6 gap-y-3 items-baseline">
        <dt className="typography-label text-muted-foreground">Status</dt>
        <dd>
          <DomainStatusBadge status={spec.status} />
          {spec.status === "pending" && (
            <span className="ml-2 typography-caption text-muted-foreground">
              · checking…
            </span>
          )}
        </dd>

        <dt className="typography-label text-muted-foreground">Last checked</dt>
        <dd className="typography-label text-foreground">
          {formatRelative(spec.lastVerifiedAt)}
        </dd>

        {spec.status === "failed" && spec.verificationError && (
          <>
            <dt className="typography-label text-muted-foreground">Error</dt>
            <dd className="flex flex-col gap-2">
              <p className="typography-body text-state-errored-text">
                {spec.verificationError}
              </p>
              <Button
                variant="secondary"
                onClick={handleRetry}
                disabled={isRetrying}
                className="self-start"
              >
                {isRetrying ? "Retrying…" : "Retry verification"}
              </Button>
            </dd>
          </>
        )}

        {spec.status === "pending" && (
          <>
            <dt className="typography-label text-muted-foreground">Checking</dt>
            <dd className="typography-body text-muted-foreground">
              DNS propagation can take up to 48h. The status above updates
              automatically — no refresh needed.
            </dd>
          </>
        )}
      </dl>
    </Band>
  );
}
