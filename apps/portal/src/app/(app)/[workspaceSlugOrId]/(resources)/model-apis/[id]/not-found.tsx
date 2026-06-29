"use client";

import { useParams } from "next/navigation";
import ResourceNotFound from "@/components/shell/resource-not-found";

export default function ModelNotFound() {
  const { workspaceSlugOrId, id } = useParams<{
    workspaceSlugOrId: string;
    id: string;
  }>();
  return (
    <ResourceNotFound
      resourceLabel="Model"
      resourceTypeSlug="model-apis"
      id={id}
      supportingLine="This model isn't available in this workspace."
      listHref={`/${workspaceSlugOrId}/model-apis`}
      listLabel="Go to Model APIs"
    />
  );
}
