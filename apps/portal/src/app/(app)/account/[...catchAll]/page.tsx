import { notFound } from "next/navigation";

// Catch-all under /account/* — propagates unmatched URLs to
// (account)/account/not-found.tsx wrapped by AccountShell, instead of falling
// through to root global-not-found.tsx (which renders without the sidebar).
// Per docs/conventions/app-conventions.loading-and-errors.md
// § "Next.js 16: global-not-found.tsx shadows group-level not-found.tsx".
export default function AccountCatchAll() {
  notFound();
}
