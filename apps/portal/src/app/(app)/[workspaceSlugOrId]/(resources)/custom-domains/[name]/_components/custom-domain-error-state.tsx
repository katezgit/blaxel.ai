import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Breadcrumb } from "@/components/shell/breadcrumb";

interface CustomDomainErrorStateProps {
  workspaceSlug: string;
  name: string;
}

export function CustomDomainErrorState({
  workspaceSlug,
  name,
}: CustomDomainErrorStateProps) {
  const listHref = `/${workspaceSlug}/custom-domains`;
  return (
    <>
      <div className="flex flex-col gap-3">
        <Breadcrumb parent={{ href: listHref, label: "Custom domains" }} current={name} />
        <Link
          href={listHref}
          className="inline-flex items-center gap-1 self-start typography-label text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Custom domains
        </Link>
      </div>

      <div className="rounded-md border border-state-errored-subtle bg-state-errored-subtle p-6">
        <p className="typography-body text-state-errored-text">
          Custom domain{" "}
          <span className="font-mono text-foreground">{name}</span> could not
          be loaded — refresh to retry.
        </p>
      </div>
    </>
  );
}
