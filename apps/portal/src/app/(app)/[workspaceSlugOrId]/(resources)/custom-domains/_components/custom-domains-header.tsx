import type { ReactNode } from "react";

interface CustomDomainsHeaderProps {
  action: ReactNode;
}

export function CustomDomainsHeader({ action }: CustomDomainsHeaderProps) {
  return (
    <header className="page-header">
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="typography-display font-semibold text-foreground">
            Custom domains
          </h1>
          <p className="typography-body text-muted-foreground">
            Customer-owned DNS mapped to Sandbox preview URLs, with managed TLS.
            Region-locked per domain.
          </p>
        </div>
        <div className="shrink-0">{action}</div>
      </div>
    </header>
  );
}
