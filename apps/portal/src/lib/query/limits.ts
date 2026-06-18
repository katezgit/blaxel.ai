import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchLimits } from "@/lib/mock/limits";

export const limitQueries = {
  list: (accountId: string) =>
    queryOptions({
      queryKey: queryKeys.limits(accountId),
      queryFn: () => fetchLimits(accountId),
    }),
};
