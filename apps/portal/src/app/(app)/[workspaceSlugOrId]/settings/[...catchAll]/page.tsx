import { notFound } from "next/navigation";

// Catch-all under /{workspace}/settings/* — propagates unmatched URLs to
// settings/not-found.tsx wrapped by the WorkspaceShell's settings sub-shell,
// instead of falling through to root global-not-found.tsx (which renders
// without the sidebar). Per docs/conventions/app-conventions.loading-and-errors.md
// § "Next.js 16: global-not-found.tsx shadows group-level not-found.tsx".
export default function WorkspaceSettingsCatchAll() {
  notFound();
}
