"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import type {
  CustomDomain,
  CustomDomainStatus,
} from "@/lib/mock/custom-domains";
import { formatRelative } from "../../_lib/relative-time";
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
    <Band title="Verification">
      <dl className="grid grid-cols-[140px_1fr] gap-x-6 gap-y-4 items-baseline">
        <dt className="typography-body text-muted-foreground">Status</dt>
        <dd>
          <VerificationStatusIndicator status={spec.status} />
        </dd>

        <dt className="typography-body text-muted-foreground">Last checked</dt>
        <dd className="typography-body text-foreground">
          {formatRelative(spec.lastVerifiedAt)}
        </dd>

        {spec.status === "failed" && spec.verificationError && (
          <>
            <dt className="typography-body text-muted-foreground">Error</dt>
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
            <dt className="typography-body text-muted-foreground">Checking</dt>
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

interface VerificationStatusIndicatorProps {
  status: CustomDomainStatus;
}

// Inline status indicator — visually mirrors the per-record check outcomes in
// DnsRecordsBand (`✓ Matched`, `○ Checking…`, `✕ Not found`) so every diagnostic
// surface on the page uses the same icon + colored text rhythm. The formal
// pill badge stays in the page header as the page-level headline.
function VerificationStatusIndicator({ status }: VerificationStatusIndicatorProps) {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-2 typography-body font-medium text-state-scored-text">
        <Check className="size-4" aria-hidden="true" />
        Verified
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-2 typography-body font-medium text-state-warning-text">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 typography-body font-medium text-state-errored-text">
      <X className="size-4" aria-hidden="true" />
      Failed
    </span>
  );
}
