export type JobStatus = "running" | "queued" | "succeeded" | "failed";

export interface Job {
  id: string;
  name: string;
  status: JobStatus;
  startedAt: string | null;
  durationSec: number | null;
}

const FIXTURES: ReadonlyArray<Job> = [
  {
    id: "job_eval_2026_06_18",
    name: "eval-2026-06-18",
    status: "running",
    startedAt: "2026-06-18T09:12:00Z",
    durationSec: null,
  },
  {
    id: "job_nightly_browse",
    name: "nightly-browse",
    status: "succeeded",
    startedAt: "2026-06-18T02:00:00Z",
    durationSec: 1_842,
  },
  {
    id: "job_index_corpus",
    name: "index-corpus",
    status: "queued",
    startedAt: null,
    durationSec: null,
  },
  {
    id: "job_finetune_v3",
    name: "finetune-v3",
    status: "failed",
    startedAt: "2026-06-17T19:30:00Z",
    durationSec: 612,
  },
  {
    id: "job_dataset_export",
    name: "dataset-export",
    status: "succeeded",
    startedAt: "2026-06-17T11:00:00Z",
    durationSec: 240,
  },
];

export async function fetchJobs(
  _accountId: string,
  _workspaceId: string,
): Promise<ReadonlyArray<Job>> {
  void _accountId;
  void _workspaceId;
  return [...FIXTURES];
}
