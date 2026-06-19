import type { Metadata } from "next";
import { resolveWorkspace } from "@/lib/mock/org";
import { NameSettingsClient } from "./_components/name-settings-client";

export const metadata: Metadata = {
  title: "Workspace settings · Name",
};

interface PageProps {
  params: Promise<{ workspaceSlugOrId: string }>;
}

export default async function WorkspaceNamePage({ params }: PageProps) {
  const { workspaceSlugOrId } = await params;
  const workspace = resolveWorkspace(workspaceSlugOrId);

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">
          Workspace name
        </h1>
      </header>
      <NameSettingsClient workspace={workspace} />
    </div>
  );
}
