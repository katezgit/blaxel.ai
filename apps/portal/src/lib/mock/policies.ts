export type PolicyStatus = "enforced" | "audit" | "draft";

export interface Policy {
  id: string;
  name: string;
  status: PolicyStatus;
  /** Concise rule summary. */
  rule: string;
}

const FIXTURES: ReadonlyArray<Policy> = [
  {
    id: "pol_egress_allowlist",
    name: "egress-allowlist",
    status: "enforced",
    rule: "Outbound HTTP restricted to *.acme.dev + *.openai.com.",
  },
  {
    id: "pol_no_shell_curl",
    name: "no-shell-curl",
    status: "enforced",
    rule: "Block `curl` invocations from agent shells.",
  },
  {
    id: "pol_max_runtime",
    name: "max-runtime",
    status: "audit",
    rule: "Flag agent runs exceeding 30 minutes wall-clock.",
  },
  {
    id: "pol_secrets_redact",
    name: "secrets-redact",
    status: "draft",
    rule: "Redact strings matching org secret patterns from logs.",
  },
];

export async function fetchPolicies(
  _accountId: string,
  _workspaceId: string,
): Promise<ReadonlyArray<Policy>> {
  void _accountId;
  void _workspaceId;
  return [...FIXTURES];
}
