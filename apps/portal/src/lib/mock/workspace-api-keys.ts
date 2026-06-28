import type { ApiKey } from "@/lib/mock/types";

/**
 * Workspace-scoped API keys — issued to either a workspace member or a
 * service account. Per `docs/product/platform.md`, every key acts within
 * the workspace using the holder's role. The table surfaces who holds the
 * key so a reviewer can audit blast radius at a glance.
 *
 * Dates are computed at request time relative to "now" so the relative
 * "in Nd" labels and the near-expiry warning highlight stay stable as
 * wall-clock time drifts in this mock-only demo.
 */
const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const isoDate = (offsetDays: number): string =>
  new Date(Date.now() + offsetDays * DAY_MS).toISOString().slice(0, 10);

const isoAgo = (deltaMs: number): string =>
  new Date(Date.now() - deltaMs).toISOString();

const buildFixtures = (): ReadonlyArray<ApiKey> => [
  {
    id: "wsk_runtime",
    name: "runtime-default",
    masked: "bxl_xxxx…7t",
    createdAt: isoDate(-20),
    expiresAt: null,
    lastUsedAt: isoAgo(3 * MINUTE_MS),
    issuedTo: { kind: "service-account", id: "svc_runtime", name: "runtime-orchestrator" },
  },
  {
    id: "wsk_ci",
    name: "ci-deploy-key",
    masked: "bxl_xxxx…Hm",
    createdAt: isoDate(-87),
    expiresAt: isoDate(3),
    lastUsedAt: isoAgo(2 * HOUR_MS),
    issuedTo: { kind: "service-account", id: "svc_ci_deploy", name: "ci-deploy" },
  },
  {
    id: "wsk_maya",
    name: "maya-local-dev",
    masked: "bxl_xxxx…Qa",
    createdAt: isoDate(-32),
    expiresAt: null,
    lastUsedAt: isoAgo(5 * DAY_MS),
    issuedTo: { kind: "member", id: "u_maya", name: "Maya Reyes" },
  },
  {
    id: "wsk_eval",
    name: "eval-harness-key",
    masked: "bxl_xxxx…ZF",
    createdAt: isoDate(-30),
    expiresAt: isoDate(60),
    lastUsedAt: isoAgo(2 * DAY_MS),
    issuedTo: { kind: "service-account", id: "svc_eval", name: "eval-harness" },
  },
  {
    id: "wsk_avery",
    name: "avery-laptop",
    masked: "bxl_xxxx…3B",
    createdAt: isoDate(-56),
    expiresAt: isoDate(34),
    lastUsedAt: null,
    issuedTo: { kind: "member", id: "u_avery", name: "Avery Lin" },
  },
];

export default async function fetchWorkspaceApiKeys(
  _accountId: string,
  _workspaceId: string,
): Promise<ReadonlyArray<ApiKey>> {
  void _accountId;
  void _workspaceId;
  await new Promise((r) => setTimeout(r, 60));
  return buildFixtures();
}
