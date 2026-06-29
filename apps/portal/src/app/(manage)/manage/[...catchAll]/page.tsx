import { notFound } from "next/navigation";

// Catch-all under /manage/* that calls notFound() so unmatched URLs pin to
// (manage)/not-found.tsx wrapped by ManageShell — keeps the manage sidebar
// mounted on deep misses.
export default function ManageCatchAll() {
  notFound();
}
