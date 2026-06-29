import { Breadcrumb } from "@/components/shell/breadcrumb";
import ResourceNotFound from "@/components/shell/resource-not-found";

interface CustomDomainNotFoundProps {
  workspaceSlug: string;
  name: string;
}

export default function CustomDomainNotFound({
  workspaceSlug,
  name,
}: CustomDomainNotFoundProps) {
  const listHref = `/${workspaceSlug}/custom-domains`;
  return (
    <>
      <Breadcrumb parent={{ href: listHref, label: "Custom domains" }} current={name} />
      <ResourceNotFound
        resourceLabel="Custom domain"
        resourceTypeSlug="custom-domains"
        id={name}
        supportingLine="This custom domain isn't available in this workspace."
        listHref={listHref}
        listLabel="Go to Custom domains"
      />
    </>
  );
}
