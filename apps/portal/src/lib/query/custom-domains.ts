import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  fetchCustomDomain,
  fetchCustomDomains,
  type CustomDomainsFixture,
  type CustomDomainStatus,
} from "@/lib/mock/custom-domains";

const TYPE = "custom-domains";

export const customDomainQueries = {
  list: (
    accountId: string,
    workspaceId: string,
    fixture: CustomDomainsFixture = "populated",
  ) =>
    queryOptions({
      queryKey: queryKeys.resourceList(accountId, workspaceId, TYPE, { fixture }),
      queryFn: () => fetchCustomDomains(accountId, workspaceId, fixture),
    }),
  detail: (
    accountId: string,
    workspaceId: string,
    name: string,
    statusOverride: CustomDomainStatus | undefined,
  ) =>
    queryOptions({
      queryKey: [
        ...queryKeys.resourceDetail(accountId, workspaceId, TYPE, name),
        statusOverride ?? "default",
      ],
      queryFn: () =>
        fetchCustomDomain(accountId, workspaceId, name, statusOverride),
    }),
};
