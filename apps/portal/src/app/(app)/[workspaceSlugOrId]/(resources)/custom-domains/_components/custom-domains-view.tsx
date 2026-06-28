"use client";

import { useSearchParams } from "next/navigation";
import { ArrowUpRightIcon } from "lucide-react";
import { useAccountState } from "@/lib/mock/account-context";
import { parseCustomDomainsFixture } from "@/lib/mock/custom-domains";
import CustomDomainsTierLockedView from "./custom-domains-tier-locked-view";
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

  if (state.tier < 3) {
    return <CustomDomainsTierLockedView />;
  }

  return (
    <div className="page-shell">
      <CustomDomainsHeader
        action={<AddDomainButton />}
        description={LIST_DESCRIPTION}
      />
      <CustomDomainsLoaded fixture={fixture} />
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
