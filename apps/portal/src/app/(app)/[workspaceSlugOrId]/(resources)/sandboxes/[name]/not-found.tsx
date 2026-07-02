"use client";

import { useParams } from "next/navigation";
import ResourceNotFound from "@/components/shell/resource-not-found";

export default function SandboxNotFound() {
  const { workspaceSlugOrId, name } = useParams<{
    workspaceSlugOrId: string;
    name: string;
  }>();
  return (
    <ResourceNotFound
      resourceLabel="Sandbox"
      resourceTypeSlug="sandboxes"
      id={name}
      supportingLine="This sandbox isn't available in this workspace."
      listHref={`/${workspaceSlugOrId}/sandboxes`}
      listLabel="Go to Sandboxes"
    />
  );
}
