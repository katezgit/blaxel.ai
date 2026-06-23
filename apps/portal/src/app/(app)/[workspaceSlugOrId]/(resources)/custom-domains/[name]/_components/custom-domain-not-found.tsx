import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Breadcrumb } from "@/components/shell/breadcrumb";

interface CustomDomainNotFoundProps {
  workspaceSlug: string;
  name: string;
}

export function CustomDomainNotFound({
  workspaceSlug,
  name,
}: CustomDomainNotFoundProps) {
  const listHref = `/${workspaceSlug}/custom-domains`;
  return (
    <>
      <div className="flex flex-col gap-3">
        <Breadcrumb parent={{ href: listHref, label: "Custom domains" }} current={name} />
      </div>

      <div className="flex flex-col items-start gap-3 rounded-md border border-border bg-card p-6">
        <p className="typography-body text-foreground">
          Custom domain{" "}
          <span className="font-mono">{name}</span> not found in this workspace.
        </p>
        <Link
          href={listHref}
          className="inline-flex items-center gap-1 typography-label text-primary hover:underline"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to Custom domains
        </Link>
      </div>
    </>
  );
}
