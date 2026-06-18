import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchVolumes } from "@/lib/mock/volumes";

const TYPE = "volumes";

export const volumeQueries = {
  list: (accountId: string, workspaceId: string) =>
    queryOptions({
      queryKey: queryKeys.resourceList(accountId, workspaceId, TYPE),
      queryFn: () => fetchVolumes(accountId, workspaceId),
    }),
};
