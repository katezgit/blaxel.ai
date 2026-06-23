import { Loader2 } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/cn";
import type { CustomDomainStatus } from "@/lib/mock/custom-domains";

interface DomainStatusBadgeProps {
  status: CustomDomainStatus;
  // personality.md §7 — failure outranks success. When true, the failed
  // badge grows in pixel area (padding + body type) so it visually
  // outranks the verified/pending sibling weights at the same surface.
  prominentOnFailure?: boolean;
  className?: string;
}

export default function DomainStatusBadge({
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
    // Drop showDot in favor of an inline spinning Loader2 — verification is
    // an in-flight check, the motion communicates "we're working on this"
    // far better than a static dot. Same affordance as the inline
    // "Checking…" label on the detail page so the language reads consistent
    // across surfaces.
    return (
      <Badge variant="warning" className={className}>
        <Loader2 className="size-3 animate-spin motion-reduce:animate-none" aria-hidden="true" />
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
