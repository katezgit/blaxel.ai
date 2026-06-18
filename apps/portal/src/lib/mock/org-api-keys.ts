import { apiKeys } from "@/lib/mock/data";
import type { ApiKey } from "@/lib/mock/types";

/**
 * Organisation-level API keys — what `/manage/api-keys` displays. Workspace-
 * scoped keys live under `lib/mock/workspace-api-keys.ts` because they live on
 * the workspace branch of the cache cascade, not the account branch.
 */
export async function fetchOrgApiKeys(_accountId: string): Promise<ReadonlyArray<ApiKey>> {
  void _accountId;
  return [...apiKeys];
}
