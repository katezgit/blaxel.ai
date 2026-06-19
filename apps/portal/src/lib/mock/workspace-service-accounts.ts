import type { ServiceAccount } from "@/lib/mock/types";

const FIXTURES: ReadonlyArray<ServiceAccount> = [
  {
    id: "svc_ci_deploy",
    name: "ci-deploy",
    clientId: "bxl_svc_a8d2f01c4b7e",
    role: "admin",
    createdAt: "2026-05-22",
  },
  {
    id: "svc_runtime",
    name: "runtime-orchestrator",
    clientId: "bxl_svc_77c1f5d039a2",
    role: "member",
    createdAt: "2026-05-14",
  },
  {
    id: "svc_metrics",
    name: "metrics-collector",
    clientId: "bxl_svc_1f3aa72de0b8",
    role: "member",
    createdAt: "2026-04-30",
  },
  {
    id: "svc_eval",
    name: "eval-harness",
    clientId: "bxl_svc_d4c91200ea76",
    role: "member",
    createdAt: "2026-04-18",
  },
];

export async function fetchWorkspaceServiceAccounts(
  _accountId: string,
  _workspaceId: string,
): Promise<ReadonlyArray<ServiceAccount>> {
  void _accountId;
  void _workspaceId;
  await new Promise((r) => setTimeout(r, 60));
  return [...FIXTURES];
}
