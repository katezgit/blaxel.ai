import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/cn";
import type { CustomDomainStatus } from "@/lib/mock/custom-domains";

interface DomainStatusBadgeProps {
  status: CustomDomainStatus;
  /**
   * personality.md §7 — failure outranks success. On the detail header the
   * failed badge gets larger pixel area than verified/pending badges. The
   * table rows stay at default weight so the row-level chrome (subtle bg +
   * accent border) carries the elevation instead of the badge itself.
   */
  prominentOnFailure?: boolean;
  className?: string;
}

export function DomainStatusBadge({
  status,
  prominentOnFailure = false,
  className,
}: DomainStatusBadgeProps) {
  if (status === "verified") {
    return (
      <Badge variant="success" showDot className={className}>
        Verified
      </Badge>
    );
  }
  if (status === "pending") {
    return (
      <Badge variant="warning" showDot className={className}>
        Pending
      </Badge>
    );
  }
  return (
    <Badge
      variant="destructive"
      showDot
      className={cn(
        prominentOnFailure && "px-2.5 py-1 typography-body",
        className,
      )}
    >
      Failed
    </Badge>
  );
}
