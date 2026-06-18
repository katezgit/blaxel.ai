import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchOrgApiKeys } from "@/lib/mock/org-api-keys";

export const orgApiKeyQueries = {
  list: (accountId: string) =>
    queryOptions({
      queryKey: queryKeys.orgApiKeys(accountId),
      queryFn: () => fetchOrgApiKeys(accountId),
    }),
};
