import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchAgentDriveItems } from "@/lib/mock/agent-drive";

const TYPE = "agent-drive";

export const agentDriveQueries = {
  list: (accountId: string, workspaceId: string) =>
    queryOptions({
      queryKey: queryKeys.resourceList(accountId, workspaceId, TYPE),
      queryFn: () => fetchAgentDriveItems(accountId, workspaceId),
    }),
};
