"use client";

import { useParams } from "next/navigation";
import ResourceNotFound from "@/components/shell/resource-not-found";

export default function PolicyNotFound() {
  const { workspaceSlugOrId, name } = useParams<{
    workspaceSlugOrId: string;
    name: string;
  }>();
  return (
    <ResourceNotFound
      resourceLabel="Policy"
      resourceTypeSlug="policies"
      id={name}
      supportingLine="This policy isn't available in this workspace."
      listHref={`/${workspaceSlugOrId}/policies`}
      listLabel="Go to Policies"
    />
  );
}
