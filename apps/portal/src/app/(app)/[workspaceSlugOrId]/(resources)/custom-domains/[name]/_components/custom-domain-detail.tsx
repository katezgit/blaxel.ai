import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { CustomDomain } from "@/lib/mock/custom-domains";
import { Breadcrumb } from "@/components/shell/breadcrumb";
import { DetailHeader } from "./detail-header";
import { DnsRecordsBand } from "./dns-records-band";
import { VerificationBand } from "./verification-band";
import { CertificateBand } from "./certificate-band";
import { RoutingBand } from "./routing-band";
import { CliBand } from "./cli-band";
import { SecurityBand } from "./security-band";

interface CustomDomainDetailProps {
  workspaceSlug: string;
  domain: CustomDomain;
}

export function CustomDomainDetail({
  workspaceSlug,
  domain,
}: CustomDomainDetailProps) {
  const listHref = `/${workspaceSlug}/custom-domains`;
  return (
    <>
      <div className="flex flex-col gap-3">
        <Breadcrumb
          parent={{ href: listHref, label: "Custom domains" }}
          current={domain.metadata.name}
        />
        <Link
          href={listHref}
          className="inline-flex items-center gap-1 self-start typography-label text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Custom domains
        </Link>
        <DetailHeader domain={domain} />
      </div>

      <DnsRecordsBand domain={domain} />
      <VerificationBand domain={domain} />
      <CertificateBand domain={domain} />
      <RoutingBand workspaceSlug={workspaceSlug} domain={domain} />
      <CliBand domain={domain} />
      <SecurityBand domain={domain} />
    </>
  );
}
