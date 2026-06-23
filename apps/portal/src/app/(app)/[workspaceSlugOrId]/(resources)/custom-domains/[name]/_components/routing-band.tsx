import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CustomDomain } from "@/lib/mock/custom-domains";
import { Band } from "./band";

interface RoutingBandProps {
  workspaceSlug: string;
  domain: CustomDomain;
}

export function RoutingBand({ workspaceSlug, domain }: RoutingBandProps) {
  const { spec } = domain;
  return (
    <Band title="Routing">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 rounded-sm border border-border bg-muted-surface p-3">
          <div className="flex flex-col gap-1">
            <span className="typography-label font-medium text-foreground">
              Fallback preview
            </span>
            <span className="font-mono typography-label text-muted-foreground">
              {spec.fallbackPreviewId}
            </span>
            <span className="typography-caption text-muted-foreground">
              Unmapped subdomains route to this Sandbox preview.
            </span>
          </div>
          <Link
            href={`/${workspaceSlug}/sandboxes/${spec.fallbackPreviewId}`}
            className="inline-flex items-center gap-1 typography-label text-primary hover:underline"
          >
            View preview
            <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Band>
  );
}
