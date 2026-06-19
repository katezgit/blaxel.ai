import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import fetchWorkspaceServiceAccounts from "@/lib/mock/workspace-service-accounts";

const TYPE = "service-accounts";

export const workspaceServiceAccountQueries = {
  list: (accountId: string, workspaceId: string) =>
    queryOptions({
      queryKey: queryKeys.resourceList(accountId, workspaceId, TYPE),
      queryFn: () => fetchWorkspaceServiceAccounts(accountId, workspaceId),
    }),
};
