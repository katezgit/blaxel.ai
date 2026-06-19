import type { ApiKey } from "@/lib/mock/types";

/**
 * Workspace-scoped API keys — issued to either a workspace member or a
 * service account. Per `docs/product/platform.md`, every key acts within
 * the workspace using the holder's role. The table surfaces who holds the
 * key so a reviewer can audit blast radius at a glance.
 */
const FIXTURES: ReadonlyArray<ApiKey> = [
  {
    id: "wsk_runtime",
    name: "runtime-default",
    masked: "bxl_xxxx…7t",
    createdAt: "2026-06-01",
    expiresAt: null,
    issuedTo: { kind: "service-account", id: "svc_runtime", name: "runtime-orchestrator" },
  },
  {
    id: "wsk_ci",
    name: "ci-deploy-key",
    masked: "bxl_xxxx…Hm",
    createdAt: "2026-05-29",
    expiresAt: "2026-08-29",
    issuedTo: { kind: "service-account", id: "svc_ci_deploy", name: "ci-deploy" },
  },
  {
    id: "wsk_maya",
    name: "maya-local-dev",
    masked: "bxl_xxxx…Qa",
    createdAt: "2026-05-20",
    expiresAt: null,
    issuedTo: { kind: "member", id: "u_maya", name: "Maya Reyes" },
  },
  {
    id: "wsk_eval",
    name: "eval-harness-key",
    masked: "bxl_xxxx…ZF",
    createdAt: "2026-05-12",
    expiresAt: "2026-09-12",
    issuedTo: { kind: "service-account", id: "svc_eval", name: "eval-harness" },
  },
  {
    id: "wsk_avery",
    name: "avery-laptop",
    masked: "bxl_xxxx…3B",
    createdAt: "2026-04-26",
    expiresAt: "2026-07-26",
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
  return [...FIXTURES];
}
