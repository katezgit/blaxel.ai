import "server-only";
import { currentOrg } from "@/lib/mock/data";
import { getSession } from "@/lib/auth/session";

export interface Tenancy {
  accountId: string;
  workspaceId: string;
}

/**
 * Workspaces depend on user; resources depend on workspace. The portal has no
 * workspace selector yet, so every account gets a single default workspace
 * keyed `<accountId>-default`. Once a selector lands, this helper reads it
 * (cookie / URL / server state) without consumer churn — keys are already
 * shaped for the workspace dimension.
 */
export function getCurrentWorkspaceId(accountId: string): string {
  return `${accountId}-default`;
}

/**
 * Server-side tenancy resolver. The session cookie currently has no org
 * mapping, so we collapse to `currentOrg.id` as the active account. When
 * sessions grow an `accountId` field, swap this body without touching call
 * sites — every consumer goes through this helper.
 */
export async function getCurrentTenancy(): Promise<Tenancy> {
  await getSession();
  const accountId = currentOrg.id;
  return {
    accountId,
    workspaceId: getCurrentWorkspaceId(accountId),
  };
}
