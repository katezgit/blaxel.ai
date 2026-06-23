import type { ReactNode } from "react";
import { Badge } from "@repo/ui/components/badge";

interface CustomDomainsHeaderProps {
  /** Body block under the H1 row. List page passes a paragraph with docs links;
   * locked view passes a two-line ReactNode. */
  description: ReactNode;
  action: ReactNode;
  /** When true, surfaces a Tier-3 badge next to the heading. */
  tierLocked?: boolean;
}

export default function CustomDomainsHeader({
  description,
  action,
  tierLocked = false,
}: CustomDomainsHeaderProps) {
  return (
    <header className="page-header">
      <div className="flex items-start justify-between gap-6">
        <div className="flex max-w-2xl flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="typography-display font-semibold text-foreground">
              Custom domains
            </h1>
            {tierLocked && (
              <Badge variant="neutral" size="sm">
                Tier 3
              </Badge>
            )}
          </div>
          {description}
        </div>
        <div className="shrink-0">{action}</div>
      </div>
    </header>
  );
}
