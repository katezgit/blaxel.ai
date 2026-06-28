"use client";

import { CopyButton } from "@repo/ui/components/copy-button";
import type { ServiceAccount } from "@/lib/mock/types";

interface OauthCredentialsSectionProps {
  serviceAccount: ServiceAccount;
}

export default function OauthCredentialsSection({
  serviceAccount,
}: OauthCredentialsSectionProps) {
  return (
    <section
      aria-labelledby="sa-oauth-heading"
      className="flex flex-col gap-4"
    >
      <h2
        id="sa-oauth-heading"
        className="typography-subtitle font-semibold text-foreground"
      >
        OAuth credentials
      </h2>

      <dl className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <dt className="typography-body w-32 shrink-0 font-medium text-meta-foreground">
            Client ID
          </dt>
          <dd className="flex min-w-0 items-center gap-1.5">
            <code className="font-mono typography-code text-foreground">
              {serviceAccount.clientId}
            </code>
            <CopyButton
              value={serviceAccount.clientId}
              ariaLabel="Copy client ID"
            />
          </dd>
        </div>
        <div className="flex gap-3">
          <dt className="typography-body w-32 shrink-0 pt-px font-medium text-meta-foreground">
            Client secret
          </dt>
          <dd className="flex min-w-0 flex-col gap-0.5">
            <span className="typography-body text-meta-foreground">
              Not available &mdash; shown once at creation.
            </span>
            <span className="typography-caption leading-tight text-meta-foreground">
              To rotate, delete this service account and create a new one.
            </span>
          </dd>
        </div>
      </dl>
    </section>
  );
}
