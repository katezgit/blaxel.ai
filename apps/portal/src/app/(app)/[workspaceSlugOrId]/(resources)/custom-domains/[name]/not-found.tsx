"use client";

import { useParams } from "next/navigation";
import ResourceNotFound from "@/components/shell/resource-not-found";

export default function CustomDomainNotFound() {
  const { workspaceSlugOrId, name } = useParams<{
    workspaceSlugOrId: string;
    name: string;
  }>();
  return (
    <ResourceNotFound
      resourceLabel="Custom domain"
      resourceTypeSlug="custom-domains"
      id={name}
      supportingLine="This custom domain isn't available in this workspace."
      listHref={`/${workspaceSlugOrId}/custom-domains`}
      listLabel="Go to Custom domains"
    />
  );
}
