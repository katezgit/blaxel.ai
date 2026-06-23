"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { parseCustomDomainStatusOverride } from "@/lib/mock/custom-domains";
import { customDomainQueries } from "@/lib/query/custom-domains";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import CustomDomainNotFound from "./custom-domain-not-found";
import CustomDomainErrorState from "./custom-domain-error-state";
import CustomDomainSkeleton from "./custom-domain-skeleton";
import CustomDomainDetail from "./custom-domain-detail";

interface CustomDomainDetailViewProps {
  workspaceSlug: string;
  name: string;
}

export default function CustomDomainDetailView({
  workspaceSlug,
  name,
}: CustomDomainDetailViewProps) {
  const { accountId, workspaceId } = useCurrentTenancy();
  const searchParams = useSearchParams();
  const statusOverride = parseCustomDomainStatusOverride(searchParams.get("status"));
  const previewError = searchParams.get("preview") === "error";

  const query = useQuery({
    ...customDomainQueries.detail(accountId, workspaceId, name, statusOverride),
    enabled: !previewError,
  });

  if (previewError) {
    return <CustomDomainErrorState workspaceSlug={workspaceSlug} name={name} />;
  }
  if (query.isPending) {
    return <CustomDomainSkeleton workspaceSlug={workspaceSlug} />;
  }
  if (query.isError) {
    return <CustomDomainErrorState workspaceSlug={workspaceSlug} name={name} />;
  }
  if (query.data === null) {
    return <CustomDomainNotFound workspaceSlug={workspaceSlug} name={name} />;
  }
  return <CustomDomainDetail workspaceSlug={workspaceSlug} domain={query.data} />;
}
