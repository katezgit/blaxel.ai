import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import fetchWorkspaceIntegrations from "@/lib/mock/workspace-integrations";

const TYPE = "integrations";

export const workspaceIntegrationQueries = {
  list: (accountId: string, workspaceId: string) =>
    queryOptions({
      queryKey: queryKeys.resourceList(accountId, workspaceId, TYPE),
      queryFn: () => fetchWorkspaceIntegrations(accountId, workspaceId),
    }),
};
