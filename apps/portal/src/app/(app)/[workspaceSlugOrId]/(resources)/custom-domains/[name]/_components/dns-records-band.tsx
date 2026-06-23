import { Check, X, Loader2 } from "lucide-react";
import { CodeBlock } from "@repo/ui/components/code-block";
import { cn } from "@repo/ui/lib/cn";
import type {
  CustomDomain,
  CustomDomainStatus,
} from "@/lib/mock/custom-domains";
import { Band } from "./band";

interface DnsRecordsBandProps {
  domain: CustomDomain;
}

export function DnsRecordsBand({ domain }: DnsRecordsBandProps) {
  const { metadata, spec } = domain;
  const txtEntries = Object.entries(spec.txtRecords);

  return (
    <Band title="DNS records issued by Blaxel">
      <div className="flex flex-col gap-4">
        <RecordGroup label="CNAME">
          <RecordRow
            type="CNAME"
            host={metadata.name}
            value={spec.cnameRecords}
            status={spec.status}
            verificationError={spec.verificationError}
          />
        </RecordGroup>

        <RecordGroup label="TXT">
          <div className="flex flex-col gap-2">
            {txtEntries.map(([host, value]) => (
              <RecordRow
                key={host}
                type="TXT"
                host={host}
                value={value}
                status={spec.status}
                verificationError={spec.verificationError}
              />
            ))}
          </div>
        </RecordGroup>
      </div>
    </Band>
  );
}

interface RecordGroupProps {
  label: string;
  children: React.ReactNode;
}

function RecordGroup({ label, children }: RecordGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="typography-body font-semibold text-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

interface RecordRowProps {
  type: "CNAME" | "TXT";
  host: string;
  value: string;
  status: CustomDomainStatus;
  verificationError: string | null;
}

function RecordRow({
  type,
  host,
  value,
  status,
  verificationError,
}: RecordRowProps) {
  // Match the verificationError against THIS specific record to decide whether
  // to expand the failure annotation on this row. The error string carries
  // the exact failing record name in backticks (e.g. "TXT record
  // `_blaxel-verify.agents.acme.com` not found"). Anchor on the backtick
  // form so substring matches (e.g. CNAME `agents.acme.com` matching the TXT
  // host's tail) don't cross-trip — only the named record lights up red.
  const recordIsFailing =
    status === "failed" &&
    verificationError !== null &&
    verificationError.includes(`\`${host}\``);

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        recordIsFailing &&
          "rounded-sm border-l-2 border-state-errored bg-state-errored-subtle pl-3 pr-3 py-2",
      )}
    >
      <RecordOutcomeLabel
        type={type}
        status={status}
        recordIsFailing={recordIsFailing}
      />
      <div className="grid grid-cols-[60px_1fr] gap-x-3 gap-y-1 items-baseline">
        <span className="typography-meta uppercase tracking-wider text-meta-foreground">
          Host
        </span>
        <span className="font-mono typography-body text-foreground break-all">
          {host}
        </span>
        <span className="typography-meta uppercase tracking-wider text-meta-foreground">
          Value
        </span>
        <div className="min-w-0">
          <CodeBlock variant="inline" code={value} className="break-all" />
        </div>
      </div>
      {recordIsFailing && <RecordOutcomeDetail expectedValue={value} />}
    </div>
  );
}

interface RecordOutcomeLabelProps {
  type: "CNAME" | "TXT";
  status: CustomDomainStatus;
  recordIsFailing: boolean;
}

// Short status label rendered at the top of each record block. The expanded
// expected/observed diagnostic for a failing record renders separately at the
// bottom of the block via RecordOutcomeDetail so it sits beneath the host /
// value it refers to.
function RecordOutcomeLabel({
  type,
  status,
  recordIsFailing,
}: RecordOutcomeLabelProps) {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1.5 typography-caption font-medium text-state-scored-text">
        <Check className="size-3" aria-hidden="true" />
        Matched
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 typography-caption font-medium text-state-warning-text">
        <Loader2 className="size-3 animate-spin" aria-hidden="true" />
        Checking…
      </span>
    );
  }
  if (recordIsFailing) {
    return (
      <span className="inline-flex items-center gap-1.5 typography-caption font-medium text-state-errored-text">
        <X className="size-3" aria-hidden="true" />
        {type === "CNAME" ? "Not matched" : "Not found"}
      </span>
    );
  }
  // Failed-status domain, but this record matched — quiet success.
  return (
    <span className="inline-flex items-center gap-1.5 typography-caption font-medium text-state-scored-text">
      <Check className="size-3" aria-hidden="true" />
      Matched
    </span>
  );
}

interface RecordOutcomeDetailProps {
  expectedValue: string;
}

function RecordOutcomeDetail({ expectedValue }: RecordOutcomeDetailProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-mono typography-caption text-muted-foreground">
        expected: <span className="text-foreground">{expectedValue}</span>
      </p>
      <p className="font-mono typography-caption text-muted-foreground">
        observed: <span className="text-foreground">not present in DNS</span>
      </p>
    </div>
  );
}
