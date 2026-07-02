// Logs tab fixtures — three sources surface different shapes of evidence
// for the same Sandbox. All entries are pinned to a fixed `NOW` so the
// time-range filter is deterministic; the page reads `NOW` directly so the
// "Last 15m / 1h / 6h / 24h / 7d" filter slices a stable window regardless
// of wall-clock.

export type LogSeverity =
  | "FATAL"
  | "ERROR"
  | "WARNING"
  | "INFO"
  | "DEBUG"
  | "TRACE"
  | "UNKNOWN";

export interface LogEntry {
  id: string;
  occurredAt: string;
  level: LogSeverity;
  message: string;
}

export type LogSource = "access" | "process" | "audit";

// Anchor — every fixture entry is offset back from this. The page filter
// also reads from here so the demo is reproducible.
export const LOGS_NOW = new Date("2026-06-30T14:35:00.000Z");

function minutesAgo(minutes: number, msExtra = 0): string {
  return new Date(
    LOGS_NOW.getTime() - minutes * 60_000 - msExtra,
  ).toISOString();
}

function hoursAgo(hours: number, extraMin = 0): string {
  return minutesAgo(hours * 60 + extraMin);
}

function daysAgo(days: number, extraHours = 0): string {
  return hoursAgo(days * 24 + extraHours);
}

/* ---------------------------------------------------------------- ACCESS */
// HTTP access log. Default filter hides `/terminal/ws*` keepalive traffic
// (production capture shows ~36 noise rows of `Reattaching to existing
// terminal session` per 15 minutes). Fixture includes enough noise rows
// inside the last 1h window that the chip toggle is visibly load-bearing.

const accessNoiseTemplates: ReadonlyArray<{ path: string; status: number }> = [
  { path: "/terminal/ws/reattach", status: 101 },
  { path: "/terminal/ws/heartbeat", status: 200 },
  { path: "/terminal/ws/poll", status: 200 },
];

function buildAccessNoise(): ReadonlyArray<LogEntry> {
  // 22 rows spread across the last 1h — every ~2-3 minutes.
  return Array.from({ length: 22 }, (_, i) => {
    const tmpl = accessNoiseTemplates[i % accessNoiseTemplates.length]!;
    const offsetMin = 2 + i * 2.5;
    return {
      id: `access-noise-${i}`,
      occurredAt: minutesAgo(offsetMin, i * 137),
      level: "INFO" as const,
      message: `GET ${tmpl.path}  ${tmpl.status}  4ms  10.0.4.${17 + (i % 6)}`,
    };
  });
}

const accessSignal: ReadonlyArray<LogEntry> = [
  {
    id: "access-1",
    occurredAt: minutesAgo(1, 320),
    level: "INFO",
    message: "GET /v1/notes  200  41ms  10.0.4.17",
  },
  {
    id: "access-2",
    occurredAt: minutesAgo(2, 81),
    level: "INFO",
    message: "POST /v1/notes  201  118ms  10.0.4.17",
  },
  {
    id: "access-3",
    occurredAt: minutesAgo(3, 540),
    level: "WARNING",
    message: "GET /v1/notes/4218  404  7ms  10.0.4.17",
  },
  {
    id: "access-4",
    occurredAt: minutesAgo(6, 220),
    level: "ERROR",
    message: "POST /v1/notes  500  1804ms  10.0.4.17  upstream timeout",
  },
  {
    id: "access-5",
    occurredAt: minutesAgo(8, 410),
    level: "INFO",
    message: "GET /v1/health  200  3ms  10.0.4.17",
  },
  {
    id: "access-6",
    occurredAt: minutesAgo(11, 730),
    level: "INFO",
    message: "GET /v1/notes?cursor=eyJ0aW1lIjp9  200  62ms  10.0.4.18",
  },
  {
    id: "access-7",
    occurredAt: minutesAgo(14, 90),
    level: "INFO",
    message: "DELETE /v1/notes/4109  204  21ms  10.0.4.18",
  },
  {
    id: "access-8",
    occurredAt: minutesAgo(18, 0),
    level: "INFO",
    message: "PATCH /v1/notes/4105  200  74ms  10.0.4.17",
  },
  {
    id: "access-9",
    occurredAt: minutesAgo(22, 480),
    level: "WARNING",
    message: "GET /v1/notes/4022  410  6ms  10.0.4.18  resource gone",
  },
  {
    id: "access-10",
    occurredAt: minutesAgo(31, 0),
    level: "INFO",
    message: "POST /v1/notes  201  112ms  10.0.4.17",
  },
  {
    id: "access-11",
    occurredAt: minutesAgo(44, 0),
    level: "INFO",
    message: "GET /v1/notes  200  44ms  10.0.4.18",
  },
  {
    id: "access-12",
    occurredAt: minutesAgo(58, 0),
    level: "INFO",
    message: "GET /v1/notes  200  47ms  10.0.4.18",
  },
  {
    id: "access-13",
    occurredAt: hoursAgo(1, 18),
    level: "INFO",
    message: "GET /v1/notes  200  39ms  10.0.4.17",
  },
  {
    id: "access-14",
    occurredAt: hoursAgo(2, 5),
    level: "INFO",
    message: "POST /v1/notes  201  131ms  10.0.4.18",
  },
  {
    id: "access-15",
    occurredAt: hoursAgo(4, 27),
    level: "ERROR",
    message: "GET /v1/notes  503  18ms  10.0.4.17  database unreachable",
  },
  {
    id: "access-16",
    occurredAt: hoursAgo(5, 41),
    level: "INFO",
    message: "GET /v1/health  200  2ms  10.0.4.17",
  },
  {
    id: "access-17",
    occurredAt: hoursAgo(12, 10),
    level: "INFO",
    message: "POST /v1/notes  201  101ms  10.0.4.18",
  },
  {
    id: "access-18",
    occurredAt: hoursAgo(20, 30),
    level: "WARNING",
    message: "GET /v1/notes/3899  429  4ms  10.0.4.17  rate limited",
  },
  {
    id: "access-19",
    occurredAt: daysAgo(1, 4),
    level: "INFO",
    message: "GET /v1/notes  200  49ms  10.0.4.17",
  },
  {
    id: "access-20",
    occurredAt: daysAgo(3, 8),
    level: "INFO",
    message: "GET /v1/notes  200  46ms  10.0.4.18",
  },
];

const ACCESS_LOGS: ReadonlyArray<LogEntry> = [
  ...accessSignal,
  ...buildAccessNoise(),
].sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1));

/* --------------------------------------------------------------- PROCESS */
// Application stdout / stderr. The default tail source — most signal for
// "what is the sandbox doing right now."

const PROCESS_LOGS: ReadonlyArray<LogEntry> = [
  {
    id: "process-1",
    occurredAt: minutesAgo(0, 280),
    level: "INFO",
    message: "[next:server] ready - started server on 0.0.0.0:3000",
  },
  {
    id: "process-2",
    occurredAt: minutesAgo(0, 920),
    level: "DEBUG",
    message: "[next:server] using preset eu-fra-1 region cache",
  },
  {
    id: "process-3",
    occurredAt: minutesAgo(1, 410),
    level: "INFO",
    message: "[py:agent] tool_call planner.draft duration_ms=842",
  },
  {
    id: "process-4",
    occurredAt: minutesAgo(2, 0),
    level: "WARNING",
    message: "[py:agent] retrying http=POST notes timeout_ms=3000 attempt=2",
  },
  {
    id: "process-5",
    occurredAt: minutesAgo(2, 380),
    level: "ERROR",
    message:
      "[py:agent] httpx.ReadTimeout: HTTPSConnectionPool(host='notes.svc') timed out",
  },
  {
    id: "process-6",
    occurredAt: minutesAgo(3, 110),
    level: "TRACE",
    message: "[py:agent] context.window=3128 limit=8192 reserve=1024",
  },
  {
    id: "process-7",
    occurredAt: minutesAgo(4, 700),
    level: "DEBUG",
    message: "[node:next] revalidated /notes?cursor=2026-06 in 14ms",
  },
  {
    id: "process-8",
    occurredAt: minutesAgo(6, 50),
    level: "INFO",
    message: "[py:agent] tool_call notes.search hits=18 duration_ms=210",
  },
  {
    id: "process-9",
    occurredAt: minutesAgo(7, 540),
    level: "INFO",
    message: "[node:next] compiled /api/notes in 188ms (1244 modules)",
  },
  {
    id: "process-10",
    occurredAt: minutesAgo(9, 0),
    level: "DEBUG",
    message: "[py:agent] cache hit key=context::usr_4109::v3",
  },
  {
    id: "process-11",
    occurredAt: minutesAgo(11, 220),
    level: "FATAL",
    message:
      "[py:agent] unhandled exception in worker thread: AssertionError tool.signature mismatch",
  },
  {
    id: "process-12",
    occurredAt: minutesAgo(11, 410),
    level: "WARNING",
    message: "[py:agent] worker restart requested (pid=1042)",
  },
  {
    id: "process-13",
    occurredAt: minutesAgo(14, 0),
    level: "INFO",
    message: "[py:agent] worker booted (pid=1098)",
  },
  {
    id: "process-14",
    occurredAt: minutesAgo(18, 880),
    level: "INFO",
    message: "[node:next] request /api/notes status=200 lat=44ms",
  },
  {
    id: "process-15",
    occurredAt: minutesAgo(22, 320),
    level: "TRACE",
    message: "[py:agent] memory rss=412MiB heap=128MiB lim=1024MiB",
  },
  {
    id: "process-16",
    occurredAt: minutesAgo(28, 0),
    level: "DEBUG",
    message: "[py:agent] flushed log buffer rows=128",
  },
  {
    id: "process-17",
    occurredAt: minutesAgo(35, 0),
    level: "INFO",
    message: "[py:agent] context refresh complete duration_ms=1142",
  },
  {
    id: "process-18",
    occurredAt: minutesAgo(52, 0),
    level: "WARNING",
    message: "[py:agent] degraded notes.svc rolling p95=1820ms",
  },
  {
    id: "process-19",
    occurredAt: hoursAgo(1, 5),
    level: "INFO",
    message: "[node:next] static prerender complete pages=24",
  },
  {
    id: "process-20",
    occurredAt: hoursAgo(2, 15),
    level: "DEBUG",
    message: "[py:agent] tool registry reloaded entries=18",
  },
  {
    id: "process-21",
    occurredAt: hoursAgo(3, 40),
    level: "INFO",
    message: "[py:agent] ready — accepting requests",
  },
  {
    id: "process-22",
    occurredAt: hoursAgo(5, 12),
    level: "TRACE",
    message: "[py:agent] gc collected=24 freed=3.1MiB",
  },
  {
    id: "process-23",
    occurredAt: hoursAgo(8, 28),
    level: "INFO",
    message: "[py:agent] container init complete uptime=0s",
  },
  {
    id: "process-24",
    occurredAt: hoursAgo(14, 0),
    level: "UNKNOWN",
    message: "[node:next] (no level) telemetry beacon sent",
  },
  {
    id: "process-25",
    occurredAt: hoursAgo(21, 30),
    level: "INFO",
    message: "[py:agent] scheduled job cleanup completed rows=412",
  },
  {
    id: "process-26",
    occurredAt: daysAgo(2, 6),
    level: "INFO",
    message: "[py:agent] image upgrade applied sha=9c1e8a4d",
  },
  {
    id: "process-27",
    occurredAt: daysAgo(5, 12),
    level: "INFO",
    message: "[py:agent] first deploy — boot OK",
  },
];

/* ----------------------------------------------------------------- AUDIT */
// Workspace audit events. Coarser cadence — keys created, policies edited,
// members invited. Matches the workspace audit-log surface in production.

const AUDIT_LOGS: ReadonlyArray<LogEntry> = [
  {
    id: "audit-1",
    occurredAt: minutesAgo(4, 0),
    level: "INFO",
    message: "actor=alex@astra.dev  action=sandbox.exec  target=prod-eu-only",
  },
  {
    id: "audit-2",
    occurredAt: minutesAgo(12, 0),
    level: "INFO",
    message: "actor=alex@astra.dev  action=sandbox.ttl.extend  target=prod-eu-only  +30m",
  },
  {
    id: "audit-3",
    occurredAt: minutesAgo(38, 0),
    level: "WARNING",
    message: "actor=ci-bot  action=api-key.rotate  target=key_4f12  reason=age>90d",
  },
  {
    id: "audit-4",
    occurredAt: hoursAgo(1, 14),
    level: "INFO",
    message: "actor=sam@astra.dev  action=policy.update  target=allow-eu-only",
  },
  {
    id: "audit-5",
    occurredAt: hoursAgo(2, 30),
    level: "INFO",
    message: "actor=alex@astra.dev  action=sandbox.connect  target=prod-eu-only  via=cli",
  },
  {
    id: "audit-6",
    occurredAt: hoursAgo(3, 50),
    level: "ERROR",
    message: "actor=unknown  action=auth.failed  target=prod-eu-only  reason=invalid-token",
  },
  {
    id: "audit-7",
    occurredAt: hoursAgo(6, 8),
    level: "INFO",
    message: "actor=sam@astra.dev  action=member.invite  target=ml@astra.dev",
  },
  {
    id: "audit-8",
    occurredAt: hoursAgo(11, 0),
    level: "INFO",
    message: "actor=alex@astra.dev  action=sandbox.deploy  target=prod-eu-only  image=blaxel/node-22@9c1e8a4d",
  },
  {
    id: "audit-9",
    occurredAt: hoursAgo(18, 22),
    level: "INFO",
    message: "actor=ci-bot  action=schedule.create  target=nightly-cleanup",
  },
  {
    id: "audit-10",
    occurredAt: daysAgo(1, 10),
    level: "INFO",
    message: "actor=alex@astra.dev  action=volume.attach  target=vol-conversations",
  },
  {
    id: "audit-11",
    occurredAt: daysAgo(2, 4),
    level: "WARNING",
    message: "actor=sam@astra.dev  action=policy.update  target=allow-eu-only  diff=+1-2",
  },
  {
    id: "audit-12",
    occurredAt: daysAgo(4, 16),
    level: "INFO",
    message: "actor=alex@astra.dev  action=workspace.member.role-change  target=jordan  to=Admin",
  },
  {
    id: "audit-13",
    occurredAt: daysAgo(6, 2),
    level: "INFO",
    message: "actor=root  action=workspace.created  target=astra-prod",
  },
];

const LOGS_BY_SOURCE: Record<LogSource, ReadonlyArray<LogEntry>> = {
  access: ACCESS_LOGS,
  process: PROCESS_LOGS,
  audit: AUDIT_LOGS,
};

export function logsForSource(source: LogSource): ReadonlyArray<LogEntry> {
  return LOGS_BY_SOURCE[source];
}

/** Access-source terminal-control noise detector. Lifted out so the page
 *  filter + the chip can share the predicate. Production captures the path
 *  prefix `/terminal/ws…` from the WebSocket reattachment heartbeat that
 *  the in-Sandbox terminal pane polls. */
export function isTerminalControlTraffic(entry: LogEntry): boolean {
  return entry.message.includes(" /terminal/ws");
}
