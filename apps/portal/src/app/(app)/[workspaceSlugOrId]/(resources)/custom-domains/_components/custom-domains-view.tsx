"use client";

import { useSearchParams } from "next/navigation";
import { useAccountState } from "@/lib/mock/account-context";
import { parseCustomDomainsFixture } from "@/lib/mock/custom-domains";
import { TierLockedPanel } from "./tier-locked-panel";
import { CustomDomainsHeader } from "./custom-domains-header";
import { CustomDomainsLoaded } from "./custom-domains-loaded";
import { AddDomainButton } from "./add-domain-button";

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
export function CustomDomainsView() {
  const { state } = useAccountState();
  const searchParams = useSearchParams();
  const fixture = parseCustomDomainsFixture(searchParams.get("fixture"));
  const tierLocked = state.tier < 3;

  return (
    <>
      <CustomDomainsHeader
        action={<AddDomainButton disabled={tierLocked} />}
        tierLocked={tierLocked}
      />
      {tierLocked ? <TierLockedPanel /> : <CustomDomainsLoaded fixture={fixture} />}
    </>
  );
}
