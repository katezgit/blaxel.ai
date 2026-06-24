import { notFound } from "next/navigation";

// Catch-all under /profile/* — propagates unmatched URLs to
// (account)/profile/not-found.tsx wrapped by AccountShell (profile sub-nav),
// instead of falling through to root global-not-found.tsx (which renders
// without the sidebar). Per docs/conventions/app-conventions.loading-and-errors.md
// § "Next.js 16: global-not-found.tsx shadows group-level not-found.tsx".
export default function ProfileCatchAll() {
  notFound();
}
