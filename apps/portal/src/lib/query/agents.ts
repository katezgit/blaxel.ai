import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchAgents } from "@/lib/mock/agents";

const TYPE = "agents";

export const agentQueries = {
  list: (accountId: string, workspaceId: string) =>
    queryOptions({
      queryKey: queryKeys.resourceList(accountId, workspaceId, TYPE),
      queryFn: () => fetchAgents(accountId, workspaceId),
    }),
};
