import type { CustomDomain } from "@/lib/mock/custom-domains";
import DetailHeader from "./detail-header";
import DnsRecordsBand from "./dns-records-band";
import CertificateBand from "./certificate-band";
import RoutingBand from "./routing-band";
import SecurityBand from "./security-band";

interface CustomDomainDetailProps {
  workspaceSlug: string;
  domain: CustomDomain;
}

export default function CustomDomainDetail({
  workspaceSlug,
  domain,
}: CustomDomainDetailProps) {
  // Certificate is only issued on verification — hide the band entirely when
  // pending/failed so the page doesn't carry a placeholder section that says
  // "not yet" while the user is still acting on DNS records above.
  const isVerified = domain.spec.status === "verified";

  return (
    <>
      <DetailHeader domain={domain} workspaceSlug={workspaceSlug} />
      <DnsRecordsBand domain={domain} />
      {isVerified && <CertificateBand domain={domain} attachAbove />}
      <RoutingBand
        workspaceSlug={workspaceSlug}
        domain={domain}
        attachAbove={!isVerified}
      />
      <SecurityBand domain={domain} />
    </>
  );
}
