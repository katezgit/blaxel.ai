"use client";

import { useParams } from "next/navigation";
import InShellNotFound from "@/components/shell/in-shell-not-found";

export default function WorkspaceSettingsNotFound() {
  const params = useParams<{ workspaceSlugOrId: string }>();
  return (
    <InShellNotFound
      kind="settings"
      workspaceSlugOrId={params.workspaceSlugOrId}
    />
  );
}
