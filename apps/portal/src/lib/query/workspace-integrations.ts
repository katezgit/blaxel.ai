import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import fetchWorkspaceIntegrations, {
  fetchWorkspaceConnections,
} from "@/lib/mock/workspace-integrations";

const TYPE = "integrations";
const CONNECTIONS_TYPE = "integration-connections";

export const workspaceIntegrationQueries = {
  list: (accountId: string, workspaceId: string) =>
    queryOptions({
      queryKey: queryKeys.resourceList(accountId, workspaceId, TYPE),
      queryFn: () => fetchWorkspaceIntegrations(accountId, workspaceId),
    }),
  connections: (accountId: string, workspaceId: string) =>
    queryOptions({
      queryKey: queryKeys.resourceList(accountId, workspaceId, CONNECTIONS_TYPE),
      queryFn: () => fetchWorkspaceConnections(accountId, workspaceId),
    }),
};
