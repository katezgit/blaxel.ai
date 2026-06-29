"use client";

import { useParams } from "next/navigation";
import ResourceNotFound from "@/components/shell/resource-not-found";

export default function IntegrationNotFound() {
  const { workspaceSlugOrId, provider } = useParams<{
    workspaceSlugOrId: string;
    provider: string;
  }>();
  return (
    <ResourceNotFound
      resourceLabel="Integration"
      resourceTypeSlug="integrations"
      id={provider}
      supportingLine="This integration isn't available in this workspace."
      listHref={`/${workspaceSlugOrId}/settings/integrations`}
      listLabel="Go to Integrations"
    />
  );
}
