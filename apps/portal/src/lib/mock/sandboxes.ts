export type SandboxStatus = "running" | "idle" | "stopped";

export interface Sandbox {
  id: string;
  name: string;
  status: SandboxStatus;
  image: string;
  lastActive: string;
}

const FIXTURES: ReadonlyArray<Sandbox> = [
  {
    id: "sbx_eval_runner",
    name: "eval-runner",
    status: "running",
    image: "python:3.12-slim",
    lastActive: "2026-06-18T09:42:00Z",
  },
  {
    id: "sbx_browse_pool_01",
    name: "browse-pool-01",
    status: "running",
    image: "playwright:1.49",
    lastActive: "2026-06-18T09:38:11Z",
  },
  {
    id: "sbx_browse_pool_02",
    name: "browse-pool-02",
    status: "idle",
    image: "playwright:1.49",
    lastActive: "2026-06-18T08:11:24Z",
  },
  {
    id: "sbx_code_review_ci",
    name: "code-review-ci",
    status: "idle",
    image: "node:22-bookworm",
    lastActive: "2026-06-17T22:04:00Z",
  },
  {
    id: "sbx_legacy_repro",
    name: "legacy-repro",
    status: "stopped",
    image: "ubuntu:22.04",
    lastActive: "2026-06-15T14:20:00Z",
  },
];

export async function fetchSandboxes(
  _accountId: string,
  _workspaceId: string,
): Promise<ReadonlyArray<Sandbox>> {
  void _accountId;
  void _workspaceId;
  return [...FIXTURES];
}

export async function fetchSandbox(
  _accountId: string,
  _workspaceId: string,
  id: string,
): Promise<Sandbox | null> {
  void _accountId;
  void _workspaceId;
  return FIXTURES.find((s) => s.id === id) ?? null;
}
