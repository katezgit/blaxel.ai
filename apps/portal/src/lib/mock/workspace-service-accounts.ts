import type { ServiceAccount, ServiceAccountApiKey } from "@/lib/mock/types";

/**
 * Service accounts and their associated API keys for the workspace.
 *
 * Dates are computed at request time relative to "now" so the relative
 * countdowns ("87 days", "Expired", "5 days") and the <14d amber state
 * remain stable as wall-clock time drifts in this mock-only demo.
 */
const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const isoDate = (offsetDays: number): string =>
  new Date(Date.now() + offsetDays * DAY_MS).toISOString().slice(0, 10);

const isoAgo = (deltaMs: number): string =>
  new Date(Date.now() - deltaMs).toISOString();

const buildFixtures = (): ReadonlyArray<ServiceAccount> => {
  const ghKeys: ReadonlyArray<ServiceAccountApiKey> = [
    {
      id: "sak_gh_prod",
      serviceAccountId: "svc_ci_deploy",
      name: "prod-deploy-key",
      keyPrefix: "bxl_k_3f8c4d2a",
      expiresAt: isoDate(87),
      createdAt: isoAgo(143 * DAY_MS),
    },
    {
      id: "sak_gh_staging",
      serviceAccountId: "svc_ci_deploy",
      name: "staging-deploy-key",
      keyPrefix: "bxl_k_9a1e6f02",
      expiresAt: isoDate(5),
      createdAt: isoAgo(90 * DAY_MS),
    },
    {
      id: "sak_gh_canary",
      serviceAccountId: "svc_ci_deploy",
      name: "canary-deploy-key",
      keyPrefix: "bxl_k_77c2b1d4",
      expiresAt: null,
      createdAt: isoAgo(60 * DAY_MS),
    },
  ];

  const runtimeKeys: ReadonlyArray<ServiceAccountApiKey> = [
    {
      id: "sak_runtime_long",
      serviceAccountId: "svc_runtime",
      name: "runtime-default",
      keyPrefix: "bxl_k_4e2d8c10",
      expiresAt: null,
      createdAt: isoAgo(240 * DAY_MS),
    },
  ];

  const evalKeys: ReadonlyArray<ServiceAccountApiKey> = [
    {
      id: "sak_eval_active",
      serviceAccountId: "svc_eval",
      name: "harness-runner",
      keyPrefix: "bxl_k_d4c91200",
      expiresAt: isoDate(60),
      createdAt: isoAgo(30 * DAY_MS),
    },
    {
      id: "sak_eval_expired",
      serviceAccountId: "svc_eval",
      name: "old-runner",
      keyPrefix: "bxl_k_a01ff3e1",
      expiresAt: isoDate(-12),
      createdAt: isoAgo(120 * DAY_MS),
    },
  ];

  const ghCreated = isoAgo(143 * DAY_MS);
  const runtimeCreated = isoAgo(240 * DAY_MS);
  const metricsCreated = isoAgo(48 * DAY_MS);
  const evalCreated = isoAgo(120 * DAY_MS);

  return [
    {
      id: "svc_ci_deploy",
      name: "github-actions-deploy",
      description: "Deploy pipeline for the main branch",
      clientId: "bxl_sa_a8d2f01c4b7e",
      createdAt: ghCreated,
      // Description was tightened ~3 weeks ago — demonstrates the "Updated" caption.
      updatedAt: isoAgo(21 * DAY_MS),
      apiKeys: ghKeys,
      lastUsedAt: isoAgo(2 * HOUR_MS),
    },
    {
      id: "svc_runtime",
      name: "runtime-orchestrator",
      description: "Self-hosted agent runner — production cluster",
      clientId: "bxl_sa_77c1f5d039a2",
      createdAt: runtimeCreated,
      updatedAt: runtimeCreated,
      apiKeys: runtimeKeys,
      lastUsedAt: isoAgo(3 * MINUTE_MS),
    },
    {
      id: "svc_metrics",
      name: "metrics-collector-prod",
      description: "Prometheus scraper for workspace telemetry",
      clientId: "bxl_sa_1f3aa72de0b8",
      createdAt: metricsCreated,
      updatedAt: metricsCreated,
      apiKeys: [],
      lastUsedAt: isoAgo(12 * MINUTE_MS),
    },
    {
      id: "svc_eval",
      name: "staging-eval-harness",
      description: "Nightly eval harness against the staging workspace",
      clientId: "bxl_sa_d4c91200ea76",
      createdAt: evalCreated,
      updatedAt: evalCreated,
      apiKeys: evalKeys,
      lastUsedAt: isoAgo(2 * DAY_MS),
    },
  ];
};

export default async function fetchWorkspaceServiceAccounts(
  _accountId: string,
  _workspaceId: string,
): Promise<ReadonlyArray<ServiceAccount>> {
  void _accountId;
  void _workspaceId;
  await new Promise((r) => setTimeout(r, 60));
  return buildFixtures();
}

export async function fetchWorkspaceServiceAccount(
  _accountId: string,
  _workspaceId: string,
  id: string,
): Promise<ServiceAccount | null> {
  void _accountId;
  void _workspaceId;
  await new Promise((r) => setTimeout(r, 60));
  return buildFixtures().find((sa) => sa.id === id) ?? null;
}
