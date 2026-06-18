import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchPolicies } from "@/lib/mock/policies";

const TYPE = "policies";

export const policyQueries = {
  list: (accountId: string, workspaceId: string) =>
    queryOptions({
      queryKey: queryKeys.resourceList(accountId, workspaceId, TYPE),
      queryFn: () => fetchPolicies(accountId, workspaceId),
    }),
};
