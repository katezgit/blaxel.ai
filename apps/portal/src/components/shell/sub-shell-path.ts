// Sub-shells are the settings layers that sit "to the right" of the main
// workspace in the mental model:
//   - /profile, /profile/*                   (account profile sub-shell)
//   - /account, /account/*                   (account admin sub-shell)
//   - /{slug}/settings, /{slug}/settings/*   (workspace settings sub-shell)
// Everything else (workspace surfaces, auth, onboarding, root) is "main".
const SUB_SHELL_PATTERN =
  /^\/(?:profile|account)(?:\/|$)|^\/[^/]+\/settings(?:\/|$)/;

export type SubShellKind = "settings" | "profile" | "account";

export function isSubShellPath(pathname: string): boolean {
  return SUB_SHELL_PATTERN.test(pathname);
}

export function subShellKindForPath(pathname: string): SubShellKind | null {
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/account")) return "account";
  if (/^\/[^/]+\/settings(?:\/|$)/.test(pathname)) return "settings";
  return null;
}

/** Workspace slug for /{slug}/settings/* routes; null otherwise. */
export function workspaceSlugFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/([^/]+)\/settings(?:\/|$)/);
  return match ? (match[1] ?? null) : null;
}
