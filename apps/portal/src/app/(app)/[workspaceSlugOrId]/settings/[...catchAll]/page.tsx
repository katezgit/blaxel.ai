import { notFound } from "next/navigation";

// Catch-all under /{workspace}/settings/* — pins unmatched URLs to
// settings/not-found.tsx wrapped by the WorkspaceShell's settings sub-shell,
// so deep misses (e.g. /settings/foo/bar) keep the settings sidebar mounted
// instead of escaping to the shallower (app)/not-found.tsx boundary.
export default function WorkspaceSettingsCatchAll() {
  notFound();
}
