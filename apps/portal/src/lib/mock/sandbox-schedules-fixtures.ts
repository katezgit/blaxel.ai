// Mock data for the Sandbox detail Schedules tab. Keyed by `metadata.name`
// (the sandbox slug). Fixtures cover both branches the wireframe demands:
//   - empty schedules + empty execution history → CLI-example empty state
//   - 1–2 cron schedules + execution rows in mixed trigger-status states
//
// Per Phase 3 isolation rule, this file lives alongside the canonical
// sandboxes fixture but stays independent — no edits to `sandboxes.ts`.

export type SandboxScheduleType = "cron" | "one-time" | "delay";

export interface SandboxSchedule {
  id: string;
  type: SandboxScheduleType;
  /** Pre-formatted human label for the "When" column.
   *   - cron: a normalized cron expression, e.g. `0 3 * * *`
   *   - one-time: an absolute ISO-ish display string
   *   - delay: a relative offset, e.g. `after 30s`
   * Pre-formatted because each type has a different surface — formatting
   * the type-conditional render inline is noisier than centralizing here. */
  when: string;
  /** Shell command run inside the Sandbox. */
  command: string;
}

export type ScheduleExecutionStatus =
  | "succeeded"
  | "failed"
  | "running"
  | "skipped";

export interface ScheduleExecution {
  id: string;
  /** Display name of the parent schedule (denormalized from `SandboxSchedule.id`
   * for fixture simplicity — production would join through schedule_id). */
  scheduleLabel: string;
  status: ScheduleExecutionStatus;
  /** ISO UTC instant the execution fired. */
  occurredAt: string;
  /** Anchor into the Logs tab pre-filtered to this execution. Mocked. */
  logsHref: string;
}

export interface SandboxSchedulesData {
  schedules: ReadonlyArray<SandboxSchedule>;
  executions: ReadonlyArray<ScheduleExecution>;
}

const EMPTY: SandboxSchedulesData = {
  schedules: [],
  executions: [],
};

// Populated fixture — pinned to `next-js` so the Tier-1 hero sandbox lights
// up the populated branch end-to-end. Mixed status set covers succeeded /
// failed / running / skipped so screenshots show every tone.
const NEXT_JS: SandboxSchedulesData = {
  schedules: [
    {
      id: "sch-nightly-cleanup",
      type: "cron",
      when: "0 3 * * *",
      command: "npm run cleanup",
    },
    {
      id: "sch-warmup",
      type: "cron",
      when: "*/15 * * * *",
      command: "curl -s http://localhost:3000/api/warmup",
    },
  ],
  executions: [
    {
      id: "exec-001",
      scheduleLabel: "sch-warmup",
      status: "running",
      occurredAt: "2026-06-30T11:45:02Z",
      logsHref: "./logs?source=process&exec=exec-001",
    },
    {
      id: "exec-002",
      scheduleLabel: "sch-warmup",
      status: "succeeded",
      occurredAt: "2026-06-30T11:30:00Z",
      logsHref: "./logs?source=process&exec=exec-002",
    },
    {
      id: "exec-003",
      scheduleLabel: "sch-nightly-cleanup",
      status: "failed",
      occurredAt: "2026-06-30T03:00:14Z",
      logsHref: "./logs?source=process&exec=exec-003",
    },
    {
      id: "exec-004",
      scheduleLabel: "sch-warmup",
      status: "succeeded",
      occurredAt: "2026-06-30T11:15:00Z",
      logsHref: "./logs?source=process&exec=exec-004",
    },
    {
      id: "exec-005",
      scheduleLabel: "sch-warmup",
      status: "skipped",
      occurredAt: "2026-06-30T11:00:00Z",
      logsHref: "./logs?source=process&exec=exec-005",
    },
  ],
};

const FIXTURES: Record<string, SandboxSchedulesData> = {
  "next-js": NEXT_JS,
};

/** Pull the schedules + execution history for a given sandbox. Unknown
 * sandbox names fall through to the empty fixture — the empty-state branch
 * with the canonical CLI example covers every non-`next-js` row in the
 * sandboxes list. */
export function getSandboxSchedules(sandboxName: string): SandboxSchedulesData {
  return FIXTURES[sandboxName] ?? EMPTY;
}

/** Canonical CLI example surfaced in the Schedules empty state. Lifted to
 * a constant so the empty-state component and any future docs reference
 * read from a single source. */
export const ADD_SCHEDULE_CLI_EXAMPLE =
  "bl sandbox schedule add --cron '0 3 * * *' npm run cleanup";
