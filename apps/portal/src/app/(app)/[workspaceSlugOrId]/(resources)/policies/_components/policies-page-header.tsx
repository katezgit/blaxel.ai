import type { ReactNode } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";

interface PoliciesPageHeaderProps {
  /** Body block under the H1 row. Omit on the locked state — the card
   * below carries the narrative copy, so the header stays orientation-only. */
  description?: ReactNode;
  /** Href the `+ Create Policy` action navigates to. Omit to hide the CTA (Tier-1-locked state). */
  createHref?: string;
  /** When true, surfaces a Tier-1 badge next to the heading. */
  tierLocked?: boolean;
}

export function PoliciesPageHeader({
  description,
  createHref,
  tierLocked = false,
}: PoliciesPageHeaderProps) {
  return (
    <header className="page-header">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="typography-display font-semibold text-foreground">
            Policies
          </h1>
          {tierLocked && (
            <Badge variant="neutral" size="sm">
              Tier 1
            </Badge>
          )}
        </div>
        {createHref && (
          <Button asChild variant="primary">
            <Link href={createHref}>
              <Plus aria-hidden="true" />
              Create Policy
            </Link>
          </Button>
        )}
      </div>
      {description}
    </header>
  );
}
