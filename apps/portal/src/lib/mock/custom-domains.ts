export type CustomDomainStatus = "active" | "pending-dns" | "error";

export interface CustomDomain {
  id: string;
  domain: string;
  status: CustomDomainStatus;
  target: string;
}

const FIXTURES: ReadonlyArray<CustomDomain> = [
  {
    id: "cd_api_acme",
    domain: "api.acme.dev",
    status: "active",
    target: "agents.blaxel.run",
  },
  {
    id: "cd_eval_acme",
    domain: "eval.acme.dev",
    status: "active",
    target: "jobs.blaxel.run",
  },
  {
    id: "cd_staging_acme",
    domain: "staging.acme.dev",
    status: "pending-dns",
    target: "agents.blaxel.run",
  },
];

export async function fetchCustomDomains(
  _accountId: string,
  _workspaceId: string,
): Promise<ReadonlyArray<CustomDomain>> {
  void _accountId;
  void _workspaceId;
  return [...FIXTURES];
}
