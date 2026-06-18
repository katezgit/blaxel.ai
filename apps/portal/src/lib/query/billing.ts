import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchBillingHistory } from "@/lib/mock/billing";

export const billingQueries = {
  history: (accountId: string) =>
    queryOptions({
      queryKey: queryKeys.billing(accountId),
      queryFn: () => fetchBillingHistory(accountId),
    }),
};
