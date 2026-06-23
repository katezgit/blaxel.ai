import type { ReactNode } from "react";
import { ArrowUpRightIcon } from "lucide-react";

interface CustomDomainsHeaderProps {
  action: ReactNode;
}

export function CustomDomainsHeader({ action }: CustomDomainsHeaderProps) {
  return (
    <header className="page-header">
      <div className="flex items-start justify-between gap-6">
        <div className="flex max-w-2xl flex-col gap-1">
          <h1 className="typography-display font-semibold text-foreground">
            Custom domains
          </h1>
          <p className="typography-body text-muted-foreground">
            Customer-owned DNS mapped to Sandbox preview URLs, with managed TLS.
            Region-locked per domain.{" "}
            <a
              href="https://docs.blaxel.ai/Infrastructure/Custom-domains"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Custom domains documentation, opens in new tab"
              className="inline-flex items-baseline gap-0.5 text-muted-foreground hover:text-foreground hover:underline"
            >
              Docs
              <ArrowUpRightIcon aria-hidden="true" className="size-3 self-center" />
            </a>
            {" · "}
            <a
              href="https://docs.blaxel.ai/api-reference/customdomains/list-custom-domains"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Custom domains API reference, opens in new tab"
              className="inline-flex items-baseline gap-0.5 text-muted-foreground hover:text-foreground hover:underline"
            >
              API reference
              <ArrowUpRightIcon aria-hidden="true" className="size-3 self-center" />
            </a>
          </p>
        </div>
        <div className="shrink-0">{action}</div>
      </div>
    </header>
  );
}
