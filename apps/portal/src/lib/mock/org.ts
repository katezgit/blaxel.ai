import { currentOrg, orgAddress, orgList } from "@/lib/mock/data";
import type { Org, OrgAddress, OrgMembership } from "@/lib/mock/types";

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
