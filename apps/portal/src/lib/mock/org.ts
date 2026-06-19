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

/** Resolve a workspace by its URL slug or UUID. Falls back to currentOrg when no match. */
export function resolveWorkspace(slugOrId: string): Org {
  const match = orgList.find(
    (m) => m.org.slug === slugOrId || m.org.id === slugOrId,
  );
  return match?.org ?? currentOrg;
}
