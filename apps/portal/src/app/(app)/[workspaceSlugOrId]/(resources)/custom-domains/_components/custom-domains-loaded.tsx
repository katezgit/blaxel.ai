"use client";

import { useQuery } from "@tanstack/react-query";
import type { CustomDomainsFixture } from "@/lib/mock/custom-domains";
import { customDomainQueries } from "@/lib/query/custom-domains";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { CustomDomainsTable } from "./custom-domains-table";
import { CustomDomainsTableSkeleton } from "./custom-domains-table-skeleton";
import { CustomDomainsErrorRow } from "./custom-domains-error-row";
import { CustomDomainsEmpty } from "./custom-domains-empty";

interface CustomDomainsLoadedProps {
  fixture: CustomDomainsFixture;
}

export function CustomDomainsLoaded({ fixture }: CustomDomainsLoadedProps) {
  const { accountId, workspaceId } = useCurrentTenancy();
  const query = useQuery(customDomainQueries.list(accountId, workspaceId, fixture));

  if (query.isPending) {
    return <CustomDomainsTableSkeleton />;
  }
  if (query.isError) {
    return <CustomDomainsErrorRow />;
  }
  if (query.data.length === 0) {
    return <CustomDomainsEmpty />;
  }
  return <CustomDomainsTable domains={query.data} />;
}
