import { notFound } from "next/navigation";

// Catch-all under /account/billing/* — pins unmatched URLs to
// billing/not-found.tsx wrapped by AccountShell (Plan & billing sub-nav),
// instead of bubbling to the shallower /account/[...catchAll] route.
export default function BillingCatchAll() {
  notFound();
}
