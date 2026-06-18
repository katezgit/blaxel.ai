/**
 * Tenancy-first query key factory. The cascade is the entire point:
 * invalidate `queryKeys.workspace(accountId, wsId)` → every resource list and
 * detail under that workspace falls out. Do not break the prefix structure.
 *
 * Hierarchy:
 *   account → workspace → resource (list | detail)
 *
 * Account-level domains (members, billing, credits, …) live at
 * `['account', accountId, <domain>]` because they don't belong to a workspace.
 * Workspace-level resources live at
 * `['account', accountId, 'workspace', wsId, 'resources', <type>, …]`.
 */
export const queryKeys = {
  all: ["account"] as const,
  account: (accountId: string) => [...queryKeys.all, accountId] as const,
  accounts: () => [...queryKeys.all, "list"] as const,

  // account-level domains
  members: (accountId: string) =>
    [...queryKeys.account(accountId), "members"] as const,
  billing: (accountId: string) =>
    [...queryKeys.account(accountId), "billing"] as const,
  credits: (accountId: string) =>
    [...queryKeys.account(accountId), "credits"] as const,
  usage: (accountId: string) =>
    [...queryKeys.account(accountId), "usage"] as const,
  limits: (accountId: string) =>
    [...queryKeys.account(accountId), "limits"] as const,
  secrets: (accountId: string) =>
    [...queryKeys.account(accountId), "secrets"] as const,
  orgApiKeys: (accountId: string) =>
    [...queryKeys.account(accountId), "org-api-keys"] as const,
  orgAddress: (accountId: string) =>
    [...queryKeys.account(accountId), "org-address"] as const,

  // workspace scope
  workspace: (accountId: string, wsId: string) =>
    [...queryKeys.account(accountId), "workspace", wsId] as const,
  workspaces: (accountId: string) =>
    [...queryKeys.account(accountId), "workspaces"] as const,

  // workspace-level resources — parameterised by resource type
  resources: (accountId: string, wsId: string) =>
    [...queryKeys.workspace(accountId, wsId), "resources"] as const,
  resourceList: (
    accountId: string,
    wsId: string,
    type: string,
    filters?: Record<string, unknown>,
  ) =>
    [
      ...queryKeys.resources(accountId, wsId),
      type,
      "list",
      filters ?? {},
    ] as const,
  resourceDetail: (
    accountId: string,
    wsId: string,
    type: string,
    id: string,
  ) =>
    [
      ...queryKeys.resources(accountId, wsId),
      type,
      "detail",
      id,
    ] as const,
};
