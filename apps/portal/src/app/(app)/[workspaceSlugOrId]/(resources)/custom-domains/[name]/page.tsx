import type { Metadata } from "next";
import CustomDomainDetailView from "./_components/custom-domain-detail-view";

export const metadata: Metadata = {
  title: "Custom domain",
};

export default async function CustomDomainDetailPage({
  params,
}: {
  params: Promise<{ workspaceSlugOrId: string; name: string }>;
}) {
  const { workspaceSlugOrId, name } = await params;
  const decoded = decodeURIComponent(name);
  return (
    <div className="page-shell">
      <CustomDomainDetailView workspaceSlug={workspaceSlugOrId} name={decoded} />
    </div>
  );
}
