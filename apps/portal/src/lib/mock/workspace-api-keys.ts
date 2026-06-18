import type { ApiKey } from "@/lib/mock/types";

/**
 * Workspace-scoped API keys — what the `(app)/api-keys` page surfaces. These
 * live on the workspace branch of the cache cascade, distinct from the
 * org-level keys at `/manage/api-keys`.
 */
const FIXTURES: ReadonlyArray<ApiKey> = [
  {
    id: "wsk_runtime",
    name: "runtime-default",
    masked: "sk-ws-…-7t",
    createdAt: "2026-06-01",
    expiresAt: null,
  },
  {
    id: "wsk_eval",
    name: "eval-job",
    masked: "sk-ws-…-Hm",
    createdAt: "2026-05-29",
    expiresAt: "2026-08-29",
  },
  {
    id: "wsk_local",
    name: "local-dev",
    masked: "sk-ws-…-Qa",
    createdAt: "2026-05-20",
    expiresAt: null,
  },
];

export async function fetchWorkspaceApiKeys(
  _accountId: string,
  _workspaceId: string,
): Promise<ReadonlyArray<ApiKey>> {
  void _accountId;
  void _workspaceId;
  return [...FIXTURES];
}
