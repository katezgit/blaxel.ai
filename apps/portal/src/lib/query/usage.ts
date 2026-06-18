import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchUsage } from "@/lib/mock/usage";

export const usageQueries = {
  list: (accountId: string) =>
    queryOptions({
      queryKey: queryKeys.usage(accountId),
      queryFn: () => fetchUsage(accountId),
    }),
};
