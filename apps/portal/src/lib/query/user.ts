import { queryOptions } from "@tanstack/react-query";
import { fetchCurrentUser } from "@/lib/mock/user";

/**
 * Viewer profile. Doesn't share the account-scoped prefix because user
 * identity is the dimension *above* tenancy — switching the user reloads the
 * entire client.
 */
export const userQueries = {
  current: () =>
    queryOptions({
      queryKey: ["user", "current"] as const,
      queryFn: () => fetchCurrentUser(),
    }),
};
