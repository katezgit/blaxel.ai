import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchMcpServers } from "@/lib/mock/mcp-servers";

const TYPE = "mcp-servers";

export const mcpServerQueries = {
  list: (accountId: string, workspaceId: string) =>
    queryOptions({
      queryKey: queryKeys.resourceList(accountId, workspaceId, TYPE),
      queryFn: () => fetchMcpServers(accountId, workspaceId),
    }),
};
