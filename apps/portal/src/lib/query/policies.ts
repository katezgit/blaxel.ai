import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  fetchPolicies,
  fetchPolicy,
  fetchPolicyUsages,
} from "@/lib/mock/policies";

const TYPE = "policies";

export const policyQueries = {
  list: (accountId: string, workspaceId: string) =>
    queryOptions({
      queryKey: queryKeys.resourceList(accountId, workspaceId, TYPE),
      queryFn: () => fetchPolicies(accountId, workspaceId),
    }),
  detail: (accountId: string, workspaceId: string, name: string) =>
    queryOptions({
      queryKey: [...queryKeys.resourceList(accountId, workspaceId, TYPE), name],
      queryFn: () => fetchPolicy(accountId, workspaceId, name),
    }),
  usages: (accountId: string, workspaceId: string, name: string) =>
    queryOptions({
      queryKey: [
        ...queryKeys.resourceList(accountId, workspaceId, TYPE),
        name,
        "usages",
      ],
      queryFn: () => fetchPolicyUsages(accountId, workspaceId, name),
    }),
};
