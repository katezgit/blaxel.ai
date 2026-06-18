import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchSecrets } from "@/lib/mock/secrets";

export const secretQueries = {
  list: (accountId: string) =>
    queryOptions({
      queryKey: queryKeys.secrets(accountId),
      queryFn: () => fetchSecrets(accountId),
    }),
};
