import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchMembers, fetchMembersForUserTier } from "@/lib/mock/members";

export const memberQueries = {
  list: (accountId: string) =>
    queryOptions({
      queryKey: queryKeys.members(accountId),
      queryFn: () => fetchMembers(accountId),
    }),
  // Role-tier diff: same key prefix so invalidating `members(accountId)` clears
  // both — we only distinguish the variant in the filter tail of the key.
  listForUserTier: (accountId: string) =>
    queryOptions({
      queryKey: [...queryKeys.members(accountId), "user-tier"] as const,
      queryFn: () => fetchMembersForUserTier(accountId),
    }),
};
