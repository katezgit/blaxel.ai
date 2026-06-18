export type VolumeStatus = "attached" | "available" | "detached";

export interface Volume {
  id: string;
  name: string;
  status: VolumeStatus;
  sizeGb: number;
  attachedTo: string | null;
}

const FIXTURES: ReadonlyArray<Volume> = [
  {
    id: "vol_corpus",
    name: "training-corpus",
    status: "attached",
    sizeGb: 200,
    attachedTo: "eval-runner",
  },
  {
    id: "vol_artifacts",
    name: "model-artifacts",
    status: "attached",
    sizeGb: 80,
    attachedTo: "code-review-ci",
  },
  {
    id: "vol_browser_cache",
    name: "browser-cache",
    status: "available",
    sizeGb: 32,
    attachedTo: null,
  },
  {
    id: "vol_archive",
    name: "archive-cold",
    status: "detached",
    sizeGb: 512,
    attachedTo: null,
  },
];

export async function fetchVolumes(
  _accountId: string,
  _workspaceId: string,
): Promise<ReadonlyArray<Volume>> {
  void _accountId;
  void _workspaceId;
  return [...FIXTURES];
}
