import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ workspaceSlugOrId: string }>;
}

export default async function LegacyDangerZoneRedirect({ params }: PageProps) {
  const { workspaceSlugOrId } = await params;
  redirect(`/${workspaceSlugOrId}/settings/name`);
}
