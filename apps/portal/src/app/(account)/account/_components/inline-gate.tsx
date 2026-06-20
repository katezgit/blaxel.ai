import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";

interface InlineGateProps {
  /** Numeric tier required to unlock — e.g. 1 renders "Tier 1 required". */
  tier: number;
  /** Contextual verb completing the locked stem: "unlock", "create up to 5 workspaces", etc. */
  verb: string;
  /** Optional override label; defaults to the project-wide `Add payment method` stem. */
  ctaLabel?: string;
  /** Override the destination. Defaults to the canonical Billing payment-method anchor. */
  href?: string;
  className?: string;
}

// Locked copy stem: "Tier {N} required — add payment method to {verb}."
// CTA must be a text link, never a button or modal — enforced by design policy.
export default function InlineGate({
  tier,
  verb,
  ctaLabel = "Add payment method",
  href = "/account/billing/credits#payment-method",
  className,
}: InlineGateProps) {
  return (
    <p
      className={cn(
        "text-caption text-muted-foreground",
        className,
      )}
    >
      Tier {tier} required &mdash; add payment method to {verb}.{" "}
      <Link
        href={href}
        className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline focus-visible:shadow-focus-ring rounded-sm"
      >
        {ctaLabel}
        <ArrowRight className="size-3" aria-hidden="true" />
      </Link>
    </p>
  );
}
