/**
 * Mock fixtures for the Custom Domains surface.
 *
 * Shape mirrors the live API contract documented at
 * https://docs.blaxel.ai/api-reference/customdomains/list-custom-domains —
 * fields verbatim so the typed fixture IS the eventual API contract.
 *
 * `subjectAlternativeNames` is `array of objects` with `additionalProperties: true`
 * in the schema (no defined sub-fields). The runtime shape isn't enumerated, so
 * fixtures use `{ value: string }` and the renderer falls back to any
 * string-valued key.
 *
 * Fixture toggling: the URL search params drive which fixture set the page
 * renders, so the demo can exercise every state without re-seeding state. See
 * `useCustomDomainsFixture` / `useCustomDomainFixture` for the parse.
 */

export type CustomDomainStatus = "pending" | "verified" | "failed";

export interface CustomDomainSAN {
  value: string;
}

export interface CustomDomainMetadata {
  name: string;
  displayName: string | null;
  workspace: string;
  labels: Record<string, string>;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CustomDomainSpec {
  region: string;
  status: CustomDomainStatus;
  cnameRecords: string;
  txtRecords: Record<string, string>;
  subjectAlternativeNames: ReadonlyArray<CustomDomainSAN>;
  fallbackPreviewId: string;
  lastVerifiedAt: string | null;
  verificationError: string | null;
}

export interface CustomDomain {
  metadata: CustomDomainMetadata;
  spec: CustomDomainSpec;
}

const NOW = "2026-06-22T15:00:00.000Z";

function hoursAgo(hours: number): string {
  return new Date(Date.parse(NOW) - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(Date.parse(NOW) - days * 24 * 60 * 60 * 1000).toISOString();
}

const VERIFIED_DOMAIN: CustomDomain = {
  metadata: {
    name: "preview.acme.com",
    displayName: "Acme preview",
    workspace: "acme",
    labels: { env: "prod", team: "infra" },
    createdAt: daysAgo(2),
    createdBy: "alex@acme.com",
    updatedAt: daysAgo(1),
    updatedBy: "alex@acme.com",
  },
  spec: {
    region: "us-pdx-1",
    status: "verified",
    cnameRecords: "abcd1234.bl.run",
    txtRecords: {
      "_blaxel-verify.preview.acme.com": "bl-v=abc123xyz",
      "_blaxel-ca.preview.acme.com": "bl-ca=xyz9pqr",
    },
    subjectAlternativeNames: [
      { value: "preview.acme.com" },
      { value: "*.preview.acme.com" },
    ],
    fallbackPreviewId: "prev-abc123xyz",
    lastVerifiedAt: hoursAgo(2),
    verificationError: null,
  },
};

const PENDING_DOMAIN: CustomDomain = {
  metadata: {
    name: "staging.acme.com",
    displayName: null,
    workspace: "acme",
    labels: { env: "staging" },
    createdAt: hoursAgo(1),
    createdBy: "alex@acme.com",
    updatedAt: hoursAgo(1),
    updatedBy: "alex@acme.com",
  },
  spec: {
    region: "eu-lon-1",
    status: "pending",
    cnameRecords: "ef567890.bl.run",
    txtRecords: {
      "_blaxel-verify.staging.acme.com": "bl-v=stg456abc",
    },
    subjectAlternativeNames: [
      { value: "staging.acme.com" },
      { value: "*.staging.acme.com" },
    ],
    fallbackPreviewId: "prev-stg456abc",
    lastVerifiedAt: null,
    verificationError: null,
  },
};

const FAILED_DOMAIN: CustomDomain = {
  metadata: {
    name: "agents.acme.com",
    displayName: "Agents API",
    workspace: "acme",
    labels: { env: "prod", team: "platform" },
    createdAt: daysAgo(1),
    createdBy: "sam@acme.com",
    updatedAt: hoursAgo(4),
    updatedBy: "sam@acme.com",
  },
  spec: {
    region: "us-was-1",
    status: "failed",
    cnameRecords: "wxyz9876.bl.run",
    txtRecords: {
      "_blaxel-verify.agents.acme.com": "bl-v=fail789def",
      "_blaxel-ca.agents.acme.com": "bl-ca=ca987mno",
    },
    subjectAlternativeNames: [
      { value: "agents.acme.com" },
      { value: "*.agents.acme.com" },
    ],
    fallbackPreviewId: "prev-fail789def",
    lastVerifiedAt: hoursAgo(4),
    verificationError:
      "TXT record `_blaxel-verify.agents.acme.com` not found in DNS. Expected value: bl-v=fail789def. Publish this record to your DNS provider and retry verification.",
  },
};

const POPULATED_FIXTURE: ReadonlyArray<CustomDomain> = [
  FAILED_DOMAIN,
  PENDING_DOMAIN,
  VERIFIED_DOMAIN,
];

const FIXTURES_BY_NAME: Record<string, CustomDomain> = {
  [VERIFIED_DOMAIN.metadata.name]: VERIFIED_DOMAIN,
  [PENDING_DOMAIN.metadata.name]: PENDING_DOMAIN,
  [FAILED_DOMAIN.metadata.name]: FAILED_DOMAIN,
};

export type CustomDomainsFixture = "populated" | "empty" | "error";

const NETWORK_LATENCY_MS = 300;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchCustomDomains(
  _accountId: string,
  _workspaceId: string,
  fixture: CustomDomainsFixture = "populated",
): Promise<ReadonlyArray<CustomDomain>> {
  void _accountId;
  void _workspaceId;
  await sleep(NETWORK_LATENCY_MS);
  if (fixture === "error") {
    throw new Error("Custom domains unavailable");
  }
  if (fixture === "empty") {
    return [];
  }
  return POPULATED_FIXTURE;
}

export async function fetchCustomDomain(
  _accountId: string,
  _workspaceId: string,
  name: string,
  statusOverride?: CustomDomainStatus,
): Promise<CustomDomain | null> {
  void _accountId;
  void _workspaceId;
  await sleep(NETWORK_LATENCY_MS);
  const base = FIXTURES_BY_NAME[name];
  if (!base) return null;
  if (statusOverride && statusOverride !== base.spec.status) {
    return withStatusOverride(base, statusOverride);
  }
  return base;
}

function withStatusOverride(
  base: CustomDomain,
  status: CustomDomainStatus,
): CustomDomain {
  if (status === "verified") {
    return {
      ...base,
      spec: {
        ...base.spec,
        status: "verified",
        lastVerifiedAt: hoursAgo(2),
        verificationError: null,
      },
    };
  }
  if (status === "pending") {
    return {
      ...base,
      spec: {
        ...base.spec,
        status: "pending",
        lastVerifiedAt: null,
        verificationError: null,
      },
    };
  }
  return {
    ...base,
    spec: {
      ...base.spec,
      status: "failed",
      lastVerifiedAt: hoursAgo(4),
      verificationError:
        base.spec.verificationError ??
        `TXT record \`_blaxel-verify.${base.metadata.name}\` not found in DNS. Expected value: bl-v=expectedvalue. Publish this record to your DNS provider and retry verification.`,
    },
  };
}

export function parseCustomDomainsFixture(
  raw: string | null,
): CustomDomainsFixture {
  if (raw === "empty" || raw === "error") return raw;
  return "populated";
}

export function parseCustomDomainStatusOverride(
  raw: string | null,
): CustomDomainStatus | undefined {
  if (raw === "pending" || raw === "verified" || raw === "failed") return raw;
  return undefined;
}
