import { currentOrg, orgAddress, orgList } from "@/lib/mock/data";
import type { Org, OrgAddress, OrgMembership } from "@/lib/mock/types";

export const DEFAULT_WORKSPACE_SLUG = currentOrg.slug;

export async function fetchAccounts(): Promise<ReadonlyArray<OrgMembership>> {
  return [...orgList];
}

/**
 * Account profile (name, members count, avatar). The pre-RBAC mock returns
 * `currentOrg` for every accountId — the resolver layer above already pinned
 * the active account to `currentOrg.id`.
 */
export async function fetchAccount(_accountId: string): Promise<Org> {
  void _accountId;
  return { ...currentOrg };
}

export async function fetchOrgAddress(_accountId: string): Promise<OrgAddress> {
  void _accountId;
  return { ...orgAddress };
}

/**
 * Resolve a workspace by its URL slug or UUID. Falls back to currentOrg when
 * no match — only safe to call from routes that the workspace gate
 * ([workspaceSlugOrId]/layout.tsx) has already audited. The gate calls
 * findWorkspaceMembership() to 404 invalid/forbidden slugs before the page
 * runs, so this fallback is dead code on the happy path.
 */
export function resolveWorkspace(slugOrId: string): Org {
  const match = findWorkspaceMembership(slugOrId);
  return match?.org ?? currentOrg;
}

/**
 * Strict workspace lookup against the current user's membership list. Returns
 * null when the slug doesn't resolve OR the user has no access — the two
 * conditions are indistinguishable in the mock and should be in production too
 * (don't leak existence of workspaces the user can't see). The workspace gate
 * layout calls notFound() on null.
 */
export function findWorkspaceMembership(
  slugOrId: string,
): OrgMembership | null {
  return (
    orgList.find(
      (m) => m.org.slug === slugOrId || m.org.id === slugOrId,
    ) ?? null
  );
}
