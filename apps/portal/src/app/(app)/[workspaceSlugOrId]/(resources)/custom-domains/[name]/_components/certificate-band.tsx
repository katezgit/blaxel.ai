import { CodeBlock } from "@repo/ui/components/code-block";
import type { CustomDomain, CustomDomainSAN } from "@/lib/mock/custom-domains";
import Band from "./band";

interface CertificateBandProps {
  domain: CustomDomain;
  attachAbove?: boolean;
}

export default function CertificateBand({
  domain,
  attachAbove,
}: CertificateBandProps) {
  const { spec } = domain;
  const isIssued = spec.status === "verified";

  return (
    <Band title="Certificate" attachAbove={attachAbove}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <h3 className="typography-body font-semibold text-foreground">
            Subject alternative names (SANs)
          </h3>
          {isIssued ? (
            <ul className="flex flex-col gap-1.5">
              {spec.subjectAlternativeNames.map((san, index) => (
                <li key={`${sanDisplay(san)}-${index}`}>
                  {/* h-8 + py-0 matches the Input chrome (32px) used across
                      this page so SANs sit at the same chip height as form
                      inputs. The descendant selector re-centers CodeBlock's
                      absolute copy button into the slimmer chip — data-slot
                      is shadcn's intended caller-override surface. */}
                  <CodeBlock
                    variant="inline"
                    code={sanDisplay(san)}
                    className="h-8 py-0 [&_[data-slot=copy-button]]:top-1"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="typography-body text-muted-foreground">
              Certificate not yet issued — domain must be verified first.
            </p>
          )}
        </div>

        <p className="typography-body text-muted-foreground">
          Managed TLS via AWS Certificate Manager. Provisioned on verification.
        </p>
      </div>
    </Band>
  );
}

function sanDisplay(san: CustomDomainSAN): string {
  // The API schema declares `subjectAlternativeNames` as array of objects with
  // `additionalProperties: true` — no sub-field is enumerated. Our typed
  // fixture uses `{ value: string }`; if the live runtime ships a different
  // key (e.g. `dnsName`), the renderer falls through to the first string-valued
  // entry without changing the contract.
  if (san.value) return san.value;
  for (const [, v] of Object.entries(san)) {
    if (typeof v === "string") return v;
  }
  return "(unknown SAN entry)";
}
