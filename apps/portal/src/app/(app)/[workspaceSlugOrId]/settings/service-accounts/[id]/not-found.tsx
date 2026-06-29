"use client";

import { useParams } from "next/navigation";
import ResourceNotFound from "@/components/shell/resource-not-found";

export default function ServiceAccountNotFound() {
  const { workspaceSlugOrId, id } = useParams<{
    workspaceSlugOrId: string;
    id: string;
  }>();
  return (
    <ResourceNotFound
      resourceLabel="Service account"
      resourceTypeSlug="service-accounts"
      id={id}
      supportingLine="This service account isn't available in this workspace."
      listHref={`/${workspaceSlugOrId}/settings/service-accounts`}
      listLabel="Go to Service accounts"
    />
  );
}
