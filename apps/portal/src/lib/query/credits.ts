import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchBurnHistory, fetchCreditState } from "@/lib/mock/credits";

export const creditQueries = {
  state: (accountId: string) =>
    queryOptions({
      queryKey: queryKeys.credits(accountId),
      queryFn: () => fetchCreditState(accountId),
    }),
  burn: (accountId: string) =>
    queryOptions({
      queryKey: [...queryKeys.credits(accountId), "burn"] as const,
      queryFn: () => fetchBurnHistory(accountId),
    }),
};
