import { notFound } from "next/navigation";

// Catch-all under /account/* — pins unmatched URLs to
// (account)/account/not-found.tsx wrapped by AccountShell, so deep misses keep
// the account sidebar mounted instead of escaping to the shallower
// (app)/not-found.tsx boundary.
export default function AccountCatchAll() {
  notFound();
}
