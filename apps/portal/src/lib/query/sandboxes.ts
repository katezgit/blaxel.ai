import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchSandbox, fetchSandboxes } from "@/lib/mock/sandboxes";

const TYPE = "sandboxes";

export const sandboxQueries = {
  list: (accountId: string, workspaceId: string) =>
    queryOptions({
      queryKey: queryKeys.resourceList(accountId, workspaceId, TYPE),
      queryFn: () => fetchSandboxes(accountId, workspaceId),
    }),
  detail: (accountId: string, workspaceId: string, id: string) =>
    queryOptions({
      queryKey: queryKeys.resourceDetail(accountId, workspaceId, TYPE, id),
      queryFn: () => fetchSandbox(accountId, workspaceId, id),
    }),
};
