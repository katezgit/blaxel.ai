import { notFound } from "next/navigation";

// Catch-all under /profile/* — pins unmatched URLs to
// (account)/profile/not-found.tsx wrapped by AccountShell (profile sub-nav),
// so deep misses keep the profile sidebar mounted instead of escaping to the
// shallower (app)/not-found.tsx boundary.
export default function ProfileCatchAll() {
  notFound();
}
