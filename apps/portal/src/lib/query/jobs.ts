import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchJobs } from "@/lib/mock/jobs";

const TYPE = "jobs";

export const jobQueries = {
  list: (accountId: string, workspaceId: string) =>
    queryOptions({
      queryKey: queryKeys.resourceList(accountId, workspaceId, TYPE),
      queryFn: () => fetchJobs(accountId, workspaceId),
    }),
};
