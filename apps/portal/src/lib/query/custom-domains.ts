import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchCustomDomains } from "@/lib/mock/custom-domains";

const TYPE = "custom-domains";

export const customDomainQueries = {
  list: (accountId: string, workspaceId: string) =>
    queryOptions({
      queryKey: queryKeys.resourceList(accountId, workspaceId, TYPE),
      queryFn: () => fetchCustomDomains(accountId, workspaceId),
    }),
};
