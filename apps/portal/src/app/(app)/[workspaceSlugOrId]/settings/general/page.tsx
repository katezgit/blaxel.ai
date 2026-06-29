import type { Metadata } from "next";
import { resolveWorkspace } from "@/lib/mock/org";
import GeneralSettingsClient from "./_components/general-settings-client";

export const metadata: Metadata = {
  title: "Workspace settings · General",
};

interface PageProps {
  params: Promise<{ workspaceSlugOrId: string }>;
}

export default async function WorkspaceGeneralPage({ params }: PageProps) {
  const { workspaceSlugOrId } = await params;
  const workspace = resolveWorkspace(workspaceSlugOrId);

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="typography-display font-semibold text-foreground">General</h1>
        <p className="text-muted-foreground">
          Manage {workspace.name}&rsquo;s identity, identifiers, and account
          context.
        </p>
      </header>
      <GeneralSettingsClient workspace={workspace} />
    </div>
  );
}
