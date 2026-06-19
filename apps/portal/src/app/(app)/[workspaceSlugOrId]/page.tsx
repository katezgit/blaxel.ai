import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ workspaceSlugOrId: string }>;
}

export default async function WorkspaceRootPage({ params }: PageProps) {
  const { workspaceSlugOrId } = await params;
  redirect(`/${workspaceSlugOrId}/sandboxes`);
}
