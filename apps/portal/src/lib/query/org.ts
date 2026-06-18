import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchAccount, fetchAccounts, fetchOrgAddress } from "@/lib/mock/org";

export const orgQueries = {
  accounts: () =>
    queryOptions({
      queryKey: queryKeys.accounts(),
      queryFn: () => fetchAccounts(),
    }),
  account: (accountId: string) =>
    queryOptions({
      queryKey: queryKeys.account(accountId),
      queryFn: () => fetchAccount(accountId),
    }),
  address: (accountId: string) =>
    queryOptions({
      queryKey: queryKeys.orgAddress(accountId),
      queryFn: () => fetchOrgAddress(accountId),
    }),
};
