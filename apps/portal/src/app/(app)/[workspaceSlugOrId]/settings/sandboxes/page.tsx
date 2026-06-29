import type { Metadata } from "next";
import { resolveWorkspace } from "@/lib/mock/org";
import SandboxSettingsClient from "./_components/sandbox-settings-client";

export const metadata: Metadata = {
  title: "Workspace settings · Sandboxes",
};

interface PageProps {
  params: Promise<{ workspaceSlugOrId: string }>;
}

export default async function WorkspaceSandboxSettingsPage({
  params,
}: PageProps) {
  const { workspaceSlugOrId } = await params;
  const workspace = resolveWorkspace(workspaceSlugOrId);

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="typography-display font-semibold text-foreground">
          Sandbox settings
        </h1>
        <p className="text-muted-foreground">
          Defaults applied to every sandbox launched in {workspace.name}.
        </p>
      </header>
      <SandboxSettingsClient
        initial={workspace.sandboxSettings.disableProcessLogging}
      />
    </div>
  );
}
