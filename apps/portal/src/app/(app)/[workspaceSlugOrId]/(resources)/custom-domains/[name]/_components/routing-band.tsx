import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CustomDomain } from "@/lib/mock/custom-domains";
import Band from "./band";

interface RoutingBandProps {
  workspaceSlug: string;
  domain: CustomDomain;
  attachAbove?: boolean;
}

export default function RoutingBand({
  workspaceSlug,
  domain,
  attachAbove,
}: RoutingBandProps) {
  const { spec } = domain;
  return (
    <Band title="Routing" attachAbove={attachAbove}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="typography-body font-semibold text-foreground">
            Fallback preview
          </span>
          <span className="font-mono typography-body text-muted-foreground">
            {spec.fallbackPreviewId}
          </span>
          <span className="typography-body text-muted-foreground">
            Unmapped subdomains route to this Sandbox preview.
          </span>
        </div>
        <Link
          href={`/${workspaceSlug}/sandboxes/${spec.fallbackPreviewId}`}
          className="inline-flex items-center gap-1 rounded-sm typography-body text-primary outline-hidden hover:underline focus-visible:shadow-focus-ring"
        >
          View preview
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </Band>
  );
}
