import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ workspaceSlugOrId: string }>;
}

export default async function WorkspaceSettingsRootPage({ params }: PageProps) {
  const { workspaceSlugOrId } = await params;
  redirect(`/${workspaceSlugOrId}/settings/general`);
}
