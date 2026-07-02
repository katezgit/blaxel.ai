export type VolumeStatus = "attached" | "available" | "detached";

export type VolumeRegion =
  | "eu-fra-1"
  | "eu-lon-1"
  | "us-was-1"
  | "us-pdx-1";

export interface Volume {
  id: string;
  name: string;
  status: VolumeStatus;
  sizeGb: number;
  attachedTo: string | null;
  region: VolumeRegion;
}

const FIXTURES: ReadonlyArray<Volume> = [
  {
    id: "vol_corpus",
    name: "training-corpus",
    status: "attached",
    sizeGb: 200,
    attachedTo: "eval-runner",
    region: "eu-fra-1",
  },
  {
    id: "vol_artifacts",
    name: "model-artifacts",
    status: "attached",
    sizeGb: 80,
    attachedTo: "code-review-ci",
    region: "us-was-1",
  },
  {
    id: "vol_browser_cache",
    name: "browser-cache",
    status: "available",
    sizeGb: 32,
    attachedTo: null,
    region: "eu-lon-1",
  },
  {
    id: "vol_archive",
    name: "archive-cold",
    status: "detached",
    sizeGb: 512,
    attachedTo: null,
    region: "us-pdx-1",
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
