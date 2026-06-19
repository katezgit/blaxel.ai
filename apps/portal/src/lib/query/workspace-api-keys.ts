import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import fetchWorkspaceApiKeys from "@/lib/mock/workspace-api-keys";

const TYPE = "api-keys";

export const workspaceApiKeyQueries = {
  list: (accountId: string, workspaceId: string) =>
    queryOptions({
      queryKey: queryKeys.resourceList(accountId, workspaceId, TYPE),
      queryFn: () => fetchWorkspaceApiKeys(accountId, workspaceId),
    }),
};
