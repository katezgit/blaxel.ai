export type AgentDriveItemKind = "directory" | "file";

export interface AgentDriveItem {
  id: string;
  name: string;
  kind: AgentDriveItemKind;
  /** Bytes; null for directories. */
  size: number | null;
  updatedAt: string;
}

const FIXTURES: ReadonlyArray<AgentDriveItem> = [
  {
    id: "ad_runs",
    name: "runs/",
    kind: "directory",
    size: null,
    updatedAt: "2026-06-18T09:00:00Z",
  },
  {
    id: "ad_traces",
    name: "traces/",
    kind: "directory",
    size: null,
    updatedAt: "2026-06-17T18:42:00Z",
  },
  {
    id: "ad_prompts_md",
    name: "prompts.md",
    kind: "file",
    size: 4_812,
    updatedAt: "2026-06-16T11:22:00Z",
  },
  {
    id: "ad_eval_jsonl",
    name: "eval-2026-06-15.jsonl",
    kind: "file",
    size: 482_103,
    updatedAt: "2026-06-15T20:10:00Z",
  },
];

export async function fetchAgentDriveItems(
  _accountId: string,
  _workspaceId: string,
): Promise<ReadonlyArray<AgentDriveItem>> {
  void _accountId;
  void _workspaceId;
  return [...FIXTURES];
}
