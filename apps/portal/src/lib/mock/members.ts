import { membersAdmin, membersUser } from "@/lib/mock/data";
import type { Member } from "@/lib/mock/types";

/**
 * Members roster for an account. The pre-RBAC mock returns the admin-tier
 * roster — the role-tier diff (`membersUser`) is exposed separately for the
 * member-view client component so we don't bake role logic into the data layer.
 */
export async function fetchMembers(_accountId: string): Promise<ReadonlyArray<Member>> {
  void _accountId;
  return [...membersAdmin];
}

export async function fetchMembersForUserTier(
  _accountId: string,
): Promise<ReadonlyArray<Member>> {
  void _accountId;
  return [...membersUser];
}
