import type { CustomDomain } from "@/lib/mock/custom-domains";
import DetailHeader from "./detail-header";
import DnsRecordsBand from "./dns-records-band";
import VerificationBand from "./verification-band";
import CertificateBand from "./certificate-band";
import RoutingBand from "./routing-band";
import CliBand from "./cli-band";
import SecurityBand from "./security-band";

interface CustomDomainDetailProps {
  workspaceSlug: string;
  domain: CustomDomain;
}

export default function CustomDomainDetail({
  workspaceSlug,
  domain,
}: CustomDomainDetailProps) {
  return (
    <>
      <DetailHeader domain={domain} workspaceSlug={workspaceSlug} />
      <DnsRecordsBand domain={domain} />
      <VerificationBand domain={domain} />
      <CertificateBand domain={domain} />
      <RoutingBand workspaceSlug={workspaceSlug} domain={domain} />
      <CliBand domain={domain} />
      <SecurityBand domain={domain} />
    </>
  );
}
