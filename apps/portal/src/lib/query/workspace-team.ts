import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import fetchWorkspaceTeam from "@/lib/mock/workspace-team";

const TYPE = "team";

export const workspaceTeamQueries = {
  list: (accountId: string, workspaceId: string) =>
    queryOptions({
      queryKey: queryKeys.resourceList(accountId, workspaceId, TYPE),
      queryFn: () => fetchWorkspaceTeam(accountId, workspaceId),
    }),
};
