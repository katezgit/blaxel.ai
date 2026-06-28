"use client";

import { CodeBlock } from "@repo/ui/components/code-block";
import { CopyButton } from "@repo/ui/components/copy-button";
import type { ServiceAccount } from "@/lib/mock/types";

interface OauthCredentialsSectionProps {
  serviceAccount: ServiceAccount;
}

export default function OauthCredentialsSection({
  serviceAccount,
}: OauthCredentialsSectionProps) {
  const rotateCli = [
    `bl service-account delete ${serviceAccount.name}`,
    `bl service-account create --name ${serviceAccount.name} --role ${serviceAccount.role === "owner" ? "admin" : serviceAccount.role}`,
  ].join("\n");

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

      <div className="flex flex-col gap-1.5">
        <span className="typography-caption font-medium text-meta-foreground">
          Client ID
        </span>
        <span className="inline-flex items-center gap-1.5">
          <code className="font-mono typography-code text-foreground">
            {serviceAccount.clientId}
          </code>
          <CopyButton
            value={serviceAccount.clientId}
            ariaLabel="Copy client ID"
          />
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="typography-caption font-medium text-meta-foreground">
          Client secret
        </span>
        <span className="typography-body text-meta-foreground">
          Not available
        </span>
        <p className="typography-body text-muted-foreground">
          OAuth client secrets cannot be retrieved after creation. To rotate
          the secret, remove this service account and create a new one &mdash;
          role bindings and any API keys will need to be re-assigned.
        </p>
        <p className="typography-caption text-meta-foreground">
          This is a Blaxel API limitation.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="typography-caption text-meta-foreground">CLI</span>
        <CodeBlock variant="block" language="bash" code={rotateCli} />
      </div>
    </section>
  );
}
