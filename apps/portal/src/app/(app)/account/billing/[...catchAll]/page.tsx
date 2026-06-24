import { notFound } from "next/navigation";

// Catch-all under /account/billing/* — propagates unmatched URLs to
// billing/not-found.tsx wrapped by AccountShell (Plan & billing sub-nav),
// instead of bubbling to the shallower /account/[...catchAll] route.
// Per docs/conventions/app-conventions.loading-and-errors.md
// § "Next.js 16: global-not-found.tsx shadows group-level not-found.tsx".
export default function BillingCatchAll() {
  notFound();
}
