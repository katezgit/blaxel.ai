"use client";

import { useSearchParams } from "next/navigation";
import { ArrowUpRightIcon } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import { useAccountState } from "@/lib/mock/account-context";
import { parseCustomDomainsFixture } from "@/lib/mock/custom-domains";
import TierLockedPanel from "./tier-locked-panel";
import CustomDomainsHeader from "./custom-domains-header";
import CustomDomainsLoaded from "./custom-domains-loaded";
import AddDomainButton from "./add-domain-button";

/**
 * Top-level branch for the Custom Domains list page.
 *
 * Tier < 3 → paywall view (no data fetch).
 * Tier ≥ 3 → standard header + data list (loading / error / empty / populated
 * handled below the suspense boundary in CustomDomainsLoaded).
 *
 * Tier and fixture state are both client-side: tier lives in the mock account
 * context, fixture preview comes from `?fixture=empty|error`. Rendering server-
 * side would lose both signals on initial paint.
 */
export default function CustomDomainsView() {
  const { state } = useAccountState();
  const searchParams = useSearchParams();
  const fixture = parseCustomDomainsFixture(searchParams.get("fixture"));
  const tierLocked = state.tier < 3;

  return (
    <div className={cn("page-shell", tierLocked && "gap-8")}>
      <CustomDomainsHeader
        action={tierLocked ? null : <AddDomainButton />}
        tierLocked={tierLocked}
        description={tierLocked ? LOCKED_DESCRIPTION : LIST_DESCRIPTION}
      />
      {tierLocked ? <TierLockedPanel /> : <CustomDomainsLoaded fixture={fixture} />}
    </div>
  );
}

const LIST_DESCRIPTION = (
  <p className="typography-body text-muted-foreground">
    Customer-owned DNS mapped to Sandbox preview URLs, with managed TLS.
    Region-locked per domain.{" "}
    <a
      href="https://docs.blaxel.ai/Infrastructure/Custom-domains"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Custom domains documentation, opens in new tab"
      className="inline-flex items-baseline gap-0.5 rounded-sm text-muted-foreground outline-hidden hover:text-foreground hover:underline focus-visible:shadow-focus-ring"
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
      className="inline-flex items-baseline gap-0.5 rounded-sm text-muted-foreground outline-hidden hover:text-foreground hover:underline focus-visible:shadow-focus-ring"
    >
      API reference
      <ArrowUpRightIcon aria-hidden="true" className="size-3 self-center" />
    </a>
  </p>
);

const LOCKED_DESCRIPTION = (
  <p className="max-w-2xl typography-body text-muted-foreground">
    Route Sandbox previews through domains you own, with managed TLS and region
    pinning — available on Tier 3 and above.
  </p>
);
