"use client";

import { CopyButton } from "@repo/ui/components/copy-button";
import type { ServiceAccount } from "@/lib/mock/types";
import { formatShortDate } from "../../_components/format";

interface DetailsSectionProps {
  serviceAccount: ServiceAccount;
}

export default function DetailsSection({
  serviceAccount,
}: DetailsSectionProps) {
  const showUpdated = serviceAccount.updatedAt !== serviceAccount.createdAt;

  return (
    <section
      aria-labelledby="sa-details-heading"
      className="flex flex-col gap-4 pt-6"
    >
      <h2
        id="sa-details-heading"
        className="typography-subtitle text-foreground"
      >
        Details
      </h2>

      <dl className="flex flex-col gap-2">
        <div className="group flex items-center gap-3">
          <dt className="w-32 shrink-0 text-meta-foreground">
            Client ID
          </dt>
          <dd className="flex min-w-0 items-center gap-1.5">
            <code className="font-mono typography-code text-foreground">
              {serviceAccount.clientId}
            </code>
            <span className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <CopyButton
                value={serviceAccount.clientId}
                ariaLabel="Copy client ID"
              />
            </span>
          </dd>
        </div>
        <div className="flex items-center gap-3">
          <dt className="w-32 shrink-0 text-meta-foreground">
            Client secret
          </dt>
          <dd className="min-w-0 text-meta-foreground">
            Not available &mdash; shown once at creation.
          </dd>
        </div>
        <div className="flex items-center gap-3">
          <dt className="w-32 shrink-0 text-meta-foreground">
            Created
          </dt>
          <dd className="min-w-0 text-foreground">
            {formatShortDate(serviceAccount.createdAt)}
          </dd>
        </div>
        {showUpdated && (
          <div className="flex items-center gap-3">
            <dt className="w-32 shrink-0 text-meta-foreground">
              Updated
            </dt>
            <dd className="min-w-0 text-foreground">
              {formatShortDate(serviceAccount.updatedAt)}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
