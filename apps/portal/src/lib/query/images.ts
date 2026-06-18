import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchImages } from "@/lib/mock/images";

const TYPE = "images";

export const imageQueries = {
  list: (accountId: string, workspaceId: string) =>
    queryOptions({
      queryKey: queryKeys.resourceList(accountId, workspaceId, TYPE),
      queryFn: () => fetchImages(accountId, workspaceId),
    }),
};
