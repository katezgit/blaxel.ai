import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import fetchWorkspaceServiceAccounts, {
  fetchWorkspaceServiceAccount,
} from "@/lib/mock/workspace-service-accounts";

const TYPE = "service-accounts";

export const workspaceServiceAccountQueries = {
  list: (accountId: string, workspaceId: string) =>
    queryOptions({
      queryKey: queryKeys.resourceList(accountId, workspaceId, TYPE),
      queryFn: () => fetchWorkspaceServiceAccounts(accountId, workspaceId),
    }),
  detail: (accountId: string, workspaceId: string, id: string) =>
    queryOptions({
      queryKey: queryKeys.resourceDetail(accountId, workspaceId, TYPE, id),
      queryFn: () => fetchWorkspaceServiceAccount(accountId, workspaceId, id),
    }),
};
