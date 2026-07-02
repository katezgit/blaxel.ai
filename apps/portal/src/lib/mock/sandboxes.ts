// Canonical Sandbox shape — modeled after docs.blaxel.ai/api-reference.
// Two-axis state: deployment `status` × runtime `state` (only meaningful
// once DEPLOYED). Pill rendering precedence lives in
// `app/(app)/[workspaceSlugOrId]/(resources)/sandboxes/_components/state-pill`.

export type SandboxDeploymentStatus =
  | "DEPLOYING"
  | "DEPLOYED"
  | "FAILED"
  | "DELETING"
  | "TERMINATED"
  | "BUILT";

export type SandboxRuntimeState = "RUNNING" | "STANDBY";

export type SandboxRegion =
  | "auto"
  | "eu-fra-1"
  | "eu-lon-1"
  | "us-was-1"
  | "us-pdx-1";

export interface SandboxImageRef {
  name: string;
  sha: string;
}

/** §2.3 Failure shape — cause + HTTP status from the registry + last
 *  successful pull. Drives the inline recovery card on FAILED detail
 *  pages. */
export interface SandboxFailure {
  /** Short cause heading. Example: "Image pull failed". */
  cause: string;
  /** HTTP status from the registry that triggered the cause. */
  httpStatus: number;
  /** Last image+sha that was pulled successfully, plus when. */
  lastSuccessfulPull: {
    image: SandboxImageRef;
    occurredAt: string;
  };
}

export interface SandboxEnvVar {
  name: string;
  value: string;
  secret: boolean;
}

export interface SandboxExpirationPolicy {
  type: "ttl-idle" | "ttl-absolute" | "max-runtime";
  value: string;
  action: "delete" | "deactivate";
}

export interface SandboxVolumeMount {
  name: string;
  mountPath: string;
  readOnly: boolean;
}

export type SandboxEgressMode = "shared" | "dedicated" | "private";

export interface SandboxEvent {
  type: "deployment" | "lifecycle" | "runtime";
  status: string;
  message: string;
  time: string;
}

export interface SandboxPort {
  name: string;
  port: number;
}

/** §1.6 events timeline. `type` drives the row icon + color; `kind` is the
 *  taxonomy filter key in the band header dropdown. `groupedCount` is set
 *  only on the folded Standby↔Active summary row. */
export interface SandboxTimelineEvent {
  kind:
    | "transition"
    | "request"
    | "boot"
    | "ttl"
    | "error"
    | "spawn"
    | "terminate";
  icon:
    | "active"
    | "standby"
    | "deployed"
    | "spawned"
    | "error"
    | "terminated"
    | "ttl"
    | "request";
  label: string;
  context?: string;
  contextHref?: string;
  /** ISO timestamp; doubles as the anchor `#event-{timestamp}`. */
  occurredAt: string;
  /** Set on the folded standby↔active summary row. */
  groupedCount?: number;
}

/** §1.7 Process table rows. PID + Command rendered in `font-mono`. */
export interface SandboxProcess {
  pid: number;
  command: string;
  cpuPct: number;
  memMib: number;
  startedAt: string;
}

/** §1.7 Log tail line. `source` discriminator drives the prefix label. */
export interface SandboxLogLine {
  occurredAt: string;
  source: "node:server" | "py:agent" | "init" | "node:next";
  level: "info" | "warn" | "error" | "debug";
  message: string;
}

/** §1.8 Volume attached to this Sandbox (1:1). Region mismatch detected by
 *  comparing `region` to the parent Sandbox's `spec.region`. */
export interface SandboxAttachedVolume {
  name: string;
  href: string;
  region: SandboxRegion;
  mountPath: string;
  sizeGiB: number;
}

/** §1.8 Agent Drive attached to this Sandbox (N:N). */
export interface SandboxAttachedDrive {
  name: string;
  href: string;
  region: SandboxRegion;
  mountPath: string;
  mode: "read-only" | "read-write";
}

/** §1.9 Policy reference + resolution summary. `denial` populated when the
 *  Policy denied a call inside the active time window — flips the sub-card
 *  to warning-subtle. */
export interface SandboxAttachedPolicy {
  name: string;
  href: string;
  regionsAllowed: ReadonlyArray<string>;
  flavor: string;
  tokensPerHour: string;
  denial?: {
    deniedCall: string;
    resolutionHref: string;
  };
}

/** §1.9 API key reference. `prefix` is the truncated `bl_pk_…` form; full
 *  key never surfaces. `recentCalls` + `recentWindow` build the activity
 *  summary ("3 calls in last 1h"). */
export interface SandboxAttachedApiKey {
  prefix: string;
  href: string;
  recentCalls: number;
  recentWindow: string;
  spawnedAt: string;
}

export interface SandboxCreatedBy {
  displayName: string;
  avatarUrl: string;
}

/** Forensic provenance per wireframe §1.2 — the four shapes Alex needs to
 * answer "what spawned this Sandbox" in an incident. */
export type SandboxProvenance =
  | {
      source: "agent";
      agentName: string;
      agentHref: string;
      sessionId: string;
      occurredAt: string;
    }
  | {
      source: "job";
      jobName: string;
      jobHref: string;
      taskIndex: number;
      taskTotal: number;
      occurredAt: string;
    }
  | {
      source: "cli";
      userEmail: string;
      command: string;
      occurredAt: string;
    }
  | {
      source: "dashboard";
      userEmail: string;
      path: string;
      occurredAt: string;
    };

/** Tier-1 vitals counters (§1.4). Strip arrays are decorative texture; the
 * peak number carries the signal. `null` for the strip means "no data yet"
 * (Deploying state) — strip is omitted entirely. */
export interface SandboxVitals {
  requests: {
    total: number;
    status2xx: number;
    status4xx: number;
    status5xx: number;
  };
  peakRamGiB: number;
  ramLimitGiB: number;
  peakCpuPct: number;
  ramStrip: ReadonlyArray<number> | null;
  cpuStrip: ReadonlyArray<number> | null;
}

export interface Sandbox {
  metadata: {
    name: string;
    displayName: string;
    externalId: string;
    createdAt: string;
    workspace: string;
    createdBy: SandboxCreatedBy;
  };
  spec: {
    image: SandboxImageRef;
    region: SandboxRegion;
    memoryMib: number;
    ttl: "none" | "1d" | "7d" | "30d";
    /** Seconds until expiry; null when ttl="none". */
    expiresInSec: number | null;
    enabled: boolean;
    ports: ReadonlyArray<SandboxPort>;
    runtime: {
      envs: ReadonlyArray<SandboxEnvVar>;
    };
    lifecycle: {
      expirationPolicies: ReadonlyArray<SandboxExpirationPolicy>;
    };
    network: {
      egressMode: SandboxEgressMode;
    };
    volumes: ReadonlyArray<SandboxVolumeMount>;
  };
  status: SandboxDeploymentStatus;
  state: SandboxRuntimeState;
  /** Failure detail for FAILED rows — drives the §2.3 inline recovery band
   *  copy: cause + HTTP status from the registry + last successful pull.
   *  Absent on non-FAILED rows. */
  failure?: SandboxFailure;
  /** ISO timestamp; null when never touched (fresh deploy). */
  lastUsedAt: string | null;
  provenance: SandboxProvenance;
  vitals: SandboxVitals;
  events: ReadonlyArray<SandboxEvent>;
  /** §1.6 timeline rows. Separate from the legacy `events` field (kept for
   *  Settings → Audit consumers); the timeline carries the richer shape. */
  timeline: ReadonlyArray<SandboxTimelineEvent>;
  /** §1.7 process snapshot. Empty array signals "no processes" — Deploying
   *  and Terminated states render their own caption instead of the table. */
  processes: ReadonlyArray<SandboxProcess>;
  /** §1.7 inline log tail (~50 lines). Newest last so the tail pane reads
   *  bottom-up like a real terminal. */
  logTail: ReadonlyArray<SandboxLogLine>;
  /** §1.8 attached Volumes (1:1). Empty array → empty state. */
  attachedVolumes: ReadonlyArray<SandboxAttachedVolume>;
  /** §1.8 attached Agent Drives (N:N). Empty array → empty state. */
  attachedDrives: ReadonlyArray<SandboxAttachedDrive>;
  /** §1.9 attached Policy. `null` → "No Policy attached — workspace default
   *  applies." copy. */
  attachedPolicy: SandboxAttachedPolicy | null;
  /** §1.9 API key that spawned this Sandbox. Always present — every Sandbox
   *  is created by some key. */
  attachedApiKey: SandboxAttachedApiKey;
}

const DEFAULT_WORKSPACE = "blaxel-demo";

const DEFAULT_ENVS: ReadonlyArray<SandboxEnvVar> = [
  { name: "OPENAI_API_KEY", value: "sk-live-9d2f4a1b7c3e8a", secret: true },
  { name: "LOG_LEVEL", value: "info", secret: false },
];

const DEFAULT_VOLUMES: ReadonlyArray<SandboxVolumeMount> = [
  { name: "agent-drive", mountPath: "/mnt/data", readOnly: false },
];

const DEFAULT_PORTS: ReadonlyArray<SandboxPort> = [
  { name: "sandbox-api", port: 8080 },
  { name: "preview", port: 3000 },
];

const DEFAULT_CREATED_BY: SandboxCreatedBy = {
  displayName: "xu zy",
  avatarUrl: "https://i.pravatar.cc/40?u=xuzy",
};

function emptyVitals(): SandboxVitals {
  return {
    requests: { total: 0, status2xx: 0, status4xx: 0, status5xx: 0 },
    peakRamGiB: 0,
    ramLimitGiB: 4,
    peakCpuPct: 0,
    ramStrip: null,
    cpuStrip: null,
  };
}

function defaultExpirationPolicies(
  ttl: Sandbox["spec"]["ttl"],
): ReadonlyArray<SandboxExpirationPolicy> {
  if (ttl === "none") return [];
  return [{ type: "ttl-idle", value: ttl === "1d" ? "24h" : ttl, action: "delete" }];
}

/** Same shape as `format-helpers.imageWithShaLabel` — duplicated so fixtures
 *  stay route-folder-free. Both sides must keep the same 6-char prefix so
 *  Tier-1 meta row and Tier-2 events render the SHA consistently. */
function imageWithShaPrefix(image: SandboxImageRef): string {
  return `${image.name}@${image.sha.slice(0, 6)}`;
}

/** Tier-2 timeline shapes per wireframe §1.6 — keyed by deployment status
 *  so every fixture renders the appropriate event history at-rest. The
 *  Failed variant carries the `⚠ Error` row that pairs with the §1.4
 *  Errors counter; the grouped Standby↔Active row mirrors the wireframe
 *  example.
 *
 *  Image strings in event contexts (Deployed boot, Image pull) reuse the
 *  same `imageWithShaLabel` helper the Tier-1 meta row uses so the SHA
 *  prefix length stays consistent across the surface. */
function defaultTimeline(
  status: SandboxDeploymentStatus,
  image: SandboxImageRef,
): ReadonlyArray<SandboxTimelineEvent> {
  const imageRef = imageWithShaPrefix(image);
  if (status === "DEPLOYED") {
    return [
      {
        kind: "error",
        icon: "error",
        label: "Error",
        context: "500 from /invoke — see log line",
        contextHref: "#log-2026-06-30T11:48:12Z",
        occurredAt: "2026-06-30T11:48:12Z",
      },
      {
        kind: "transition",
        icon: "active",
        label: "Standby → Active",
        context: "request from session ses-c1e7a209",
        occurredAt: "2026-06-30T11:48:10Z",
      },
      {
        kind: "transition",
        icon: "standby",
        label: "Active → Standby",
        context: "idle for 15s",
        groupedCount: 8,
        occurredAt: "2026-06-30T11:46:55Z",
      },
      {
        kind: "transition",
        icon: "active",
        label: "Standby → Active",
        context: "request from session ses-c1e7a209",
        occurredAt: "2026-06-30T11:46:40Z",
      },
      {
        kind: "boot",
        icon: "deployed",
        label: "Deployed",
        context: `Image ${imageRef} · 28s boot`,
        occurredAt: "2026-06-30T10:54:34Z",
      },
      {
        kind: "spawn",
        icon: "spawned",
        label: "Spawned",
        context: "by Agent email-triage",
        occurredAt: "2026-06-30T10:54:06Z",
      },
    ];
  }
  if (status === "DEPLOYING") {
    return [
      {
        kind: "boot",
        icon: "deployed",
        label: "Container start",
        context: "Init scripts running",
        occurredAt: "2026-06-30T11:01:14Z",
      },
      {
        kind: "boot",
        icon: "deployed",
        label: "Image cached",
        occurredAt: "2026-06-30T11:01:09Z",
      },
      {
        kind: "boot",
        icon: "deployed",
        label: "Image pull",
        context: imageRef,
        occurredAt: "2026-06-30T11:01:02Z",
      },
      {
        kind: "spawn",
        icon: "spawned",
        label: "Spawned",
        context: "by Dashboard kate@blaxel.ai",
        occurredAt: "2026-06-30T11:01:00Z",
      },
    ];
  }
  if (status === "FAILED") {
    return [
      {
        kind: "error",
        icon: "error",
        label: "Image pull failed",
        context: "403 from registry · last successful: 3 days ago",
        occurredAt: "2026-06-30T10:54:34Z",
      },
      {
        kind: "spawn",
        icon: "spawned",
        label: "Spawned",
        context: "by CLI alex@blaxel.ai",
        occurredAt: "2026-06-30T10:49:34Z",
      },
    ];
  }
  if (status === "TERMINATED" || status === "DELETING") {
    return [
      {
        kind: "terminate",
        icon: "terminated",
        label: "Terminated",
        context: "expiresIn reached zero",
        occurredAt: "2026-06-01T08:30:00Z",
      },
      {
        kind: "spawn",
        icon: "spawned",
        label: "Spawned",
        context: "by Dashboard kate@blaxel.ai",
        occurredAt: "2026-05-15T10:00:00Z",
      },
    ];
  }
  return [];
}

const DEFAULT_PROCESSES: ReadonlyArray<SandboxProcess> = [
  {
    pid: 152,
    command: "python /app/agent_worker.py",
    cpuPct: 12,
    memMib: 420,
    startedAt: "2026-06-30T10:54:41Z",
  },
  {
    pid: 47,
    command: "node /app/server.js",
    cpuPct: 3,
    memMib: 180,
    startedAt: "2026-06-30T10:54:38Z",
  },
  {
    pid: 1,
    command: "/bin/init",
    cpuPct: 0,
    memMib: 12,
    startedAt: "2026-06-30T10:54:34Z",
  },
];

const STANDBY_PROCESSES: ReadonlyArray<SandboxProcess> = DEFAULT_PROCESSES.map(
  (p) => ({ ...p, cpuPct: 0 }),
);

const DEFAULT_LOG_TAIL: ReadonlyArray<SandboxLogLine> = [
  {
    occurredAt: "2026-06-30T11:48:11.733Z",
    source: "py:agent",
    level: "info",
    message: "Session resumed from standby",
  },
  {
    occurredAt: "2026-06-30T11:48:11.851Z",
    source: "py:agent",
    level: "info",
    message: 'Tool call: search_emails(q="from:billing")',
  },
  {
    occurredAt: "2026-06-30T11:48:11.992Z",
    source: "node:server",
    level: "info",
    message: "POST /invoke 200 89ms",
  },
  {
    occurredAt: "2026-06-30T11:48:12.034Z",
    source: "node:server",
    level: "info",
    message: "POST /invoke 200 142ms",
  },
  {
    occurredAt: "2026-06-30T11:48:12.187Z",
    source: "py:agent",
    level: "warn",
    message: "Retrying upstream call (attempt 2/3)",
  },
  {
    occurredAt: "2026-06-30T11:48:12.412Z",
    source: "node:server",
    level: "error",
    message: "POST /invoke 500 — upstream timeout",
  },
];

const FAILED_LOG_TAIL: ReadonlyArray<SandboxLogLine> = [
  {
    occurredAt: "2026-06-30T10:54:33.011Z",
    source: "init",
    level: "info",
    message: "Pulling image node20@a4f2c8 from registry",
  },
  {
    occurredAt: "2026-06-30T10:54:34.220Z",
    source: "init",
    level: "error",
    message: "Registry returned 403 — image manifest not accessible",
  },
];

const DEFAULT_POLICY: SandboxAttachedPolicy = {
  name: "prod-eu-only",
  href: "/blaxel-demo/policies/prod-eu-only",
  regionsAllowed: ["eu-fra-1", "eu-lon-1"],
  flavor: "standard-cpu",
  tokensPerHour: "1M/hr",
};

const DENIAL_POLICY: SandboxAttachedPolicy = {
  ...DEFAULT_POLICY,
  denial: {
    deniedCall: "POST /invoke from us-pdx-1 — region not in allowed set",
    resolutionHref: "/blaxel-demo/policies/prod-eu-only",
  },
};

const DEFAULT_API_KEY: SandboxAttachedApiKey = {
  prefix: "bl_pk_3f8c…",
  href: "/blaxel-demo/api-keys#bl_pk_3f8c",
  recentCalls: 3,
  recentWindow: "last 1h",
  spawnedAt: "2026-06-30T10:54:06Z",
};

const DEFAULT_ATTACHED_VOLUMES: ReadonlyArray<SandboxAttachedVolume> = [
  {
    name: "vol-conversations",
    href: "/blaxel-demo/volumes/vol-conversations",
    region: "us-pdx-1",
    mountPath: "/mnt/state",
    sizeGiB: 12.4,
  },
];

const DEFAULT_ATTACHED_DRIVES: ReadonlyArray<SandboxAttachedDrive> = [
  {
    name: "shared-corpus",
    href: "/blaxel-demo/agent-drive/shared-corpus",
    region: "us-pdx-1",
    mountPath: "/mnt/corpus",
    mode: "read-write",
  },
];

function recentCallsFor(flags: {
  isTerminated: boolean;
  isDeploying: boolean;
  isFailed: boolean;
}): number {
  if (flags.isTerminated || flags.isDeploying) return 0;
  if (flags.isFailed) return 1;
  return 3;
}

function policyFor(
  isFailed: boolean,
  name: string,
): SandboxAttachedPolicy | null {
  if (isFailed) return DENIAL_POLICY;
  if (name === "code-review-ci") return null;
  return DEFAULT_POLICY;
}

function processesFor(
  status: SandboxDeploymentStatus,
  state: SandboxRuntimeState,
): ReadonlyArray<SandboxProcess> {
  const noProcesses =
    status === "TERMINATED" ||
    status === "DELETING" ||
    status === "DEPLOYING" ||
    status === "BUILT" ||
    status === "FAILED";
  if (noProcesses) return [];
  if (state === "STANDBY") return STANDBY_PROCESSES;
  return DEFAULT_PROCESSES;
}

function logTailFor(
  status: SandboxDeploymentStatus,
): ReadonlyArray<SandboxLogLine> {
  if (status === "TERMINATED" || status === "DELETING") return [];
  if (status === "FAILED") return FAILED_LOG_TAIL;
  if (status === "DEPLOYING" || status === "BUILT") return [];
  return DEFAULT_LOG_TAIL;
}

/** Derive Tier-2 fixture defaults from the existing Tier-1 state. Keeps the
 *  fixture array readable — every named Sandbox stays free of repetitive
 *  Volumes/Drives/Policy/ApiKey blocks. State-specific shapes:
 *  - DEPLOYING / FAILED   → no processes (empty array), source-shaped logs.
 *  - DEPLOYED + RUNNING   → full process snapshot + multi-line tail.
 *  - DEPLOYED + STANDBY   → quiescent processes (CPU 0), thin tail.
 *  - TERMINATED / DELETING → empty processes + empty tail (band caption).
 *  - eu-lon-1 errored sandbox → carries denial Policy + region-mismatch
 *    surfaced via a Volume in a different region.
 */
function tier2Defaults(
  base: Omit<
    Sandbox,
    | "timeline"
    | "processes"
    | "logTail"
    | "attachedVolumes"
    | "attachedDrives"
    | "attachedPolicy"
    | "attachedApiKey"
  >,
): Pick<
  Sandbox,
  | "timeline"
  | "processes"
  | "logTail"
  | "attachedVolumes"
  | "attachedDrives"
  | "attachedPolicy"
  | "attachedApiKey"
> {
  const { status, state, metadata, spec } = base;
  const isTerminated = status === "TERMINATED" || status === "DELETING";
  const isFailed = status === "FAILED";
  const isDeploying = status === "DEPLOYING" || status === "BUILT";

  // Region-mismatch demo: attach a Volume in eu-fra-1 to a us-pdx-1 Sandbox
  // so the §1.8 mismatch row renders. Only on the canonical "next-js"
  // fixture so other Active rows stay clean.
  const attachedVolumes: ReadonlyArray<SandboxAttachedVolume> =
    metadata.name === "next-js"
      ? [
          ...DEFAULT_ATTACHED_VOLUMES,
          {
            name: "vol-eu-cache",
            href: "/blaxel-demo/volumes/vol-eu-cache",
            region: "eu-fra-1",
            mountPath: "/mnt/cache",
            sizeGiB: 4.0,
          },
        ]
      : DEFAULT_ATTACHED_VOLUMES;

  return {
    timeline: defaultTimeline(status, spec.image),
    processes: processesFor(status, state),
    logTail: logTailFor(status),
    attachedVolumes,
    attachedDrives: DEFAULT_ATTACHED_DRIVES,
    attachedPolicy: policyFor(isFailed, metadata.name),
    attachedApiKey: {
      ...DEFAULT_API_KEY,
      spawnedAt: metadata.createdAt,
      recentCalls: recentCallsFor({ isTerminated, isDeploying, isFailed }),
    },
  };
}

function defaultEvents(status: SandboxDeploymentStatus): ReadonlyArray<SandboxEvent> {
  if (status === "DEPLOYED") {
    return [
      {
        type: "deployment",
        status: "DEPLOYED",
        message: "Sandbox deployed successfully.",
        time: "2026-06-23T10:32:11Z",
      },
    ];
  }
  if (status === "DEPLOYING") {
    return [
      {
        type: "deployment",
        status: "DEPLOYING",
        message: "Pulling image and warming runtime.",
        time: "2026-06-30T09:14:02Z",
      },
    ];
  }
  if (status === "FAILED") {
    return [
      {
        type: "deployment",
        status: "FAILED",
        message: "Image pull failed — registry returned 404.",
        time: "2026-06-29T22:11:00Z",
      },
    ];
  }
  return [];
}

type Tier1Sandbox = Omit<
  Sandbox,
  | "timeline"
  | "processes"
  | "logTail"
  | "attachedVolumes"
  | "attachedDrives"
  | "attachedPolicy"
  | "attachedApiKey"
>;

// Named fixtures cover the wireframe's state-matrix anchors (Active, Standby,
// Failed, Deploying, Terminated, plus warning-state TTL). Each is deep-linked
// from the list page; each lights up a different combination of bands in
// `[name]` detail. Tier-2 fields (timeline, processes, logTail, etc.) are
// derived from the Tier-1 status / state via `tier2Defaults` below so the
// fixture array stays focused on identity + lifecycle shape.
const RAW_FIXTURES: ReadonlyArray<Tier1Sandbox> = [
  {
    metadata: {
      name: "next-js",
      displayName: "Next.js",
      externalId: "sbx-7f3a9c1e",
      createdAt: "2026-06-30T08:42:00Z",
      workspace: DEFAULT_WORKSPACE,
      createdBy: DEFAULT_CREATED_BY,
    },
    spec: {
      image: { name: "blaxel/nextjs:latest", sha: "9c1e8a4d" },
      region: "us-pdx-1",
      memoryMib: 4096,
      ttl: "1d",
      expiresInSec: 22 * 3_600 + 45 * 60 + 6,
      enabled: true,
      ports: DEFAULT_PORTS,
      runtime: { envs: DEFAULT_ENVS },
      lifecycle: { expirationPolicies: defaultExpirationPolicies("1d") },
      network: { egressMode: "shared" },
      volumes: DEFAULT_VOLUMES,
    },
    status: "DEPLOYED",
    state: "RUNNING",
    lastUsedAt: "2026-06-30T10:53:30Z",
    provenance: {
      source: "agent",
      agentName: "email-triage",
      agentHref: "/blaxel-demo/agents/email-triage",
      sessionId: "ses-c1e7a209",
      occurredAt: "2026-06-30T10:54:06Z",
    },
    vitals: {
      requests: { total: 73, status2xx: 73, status4xx: 0, status5xx: 0 },
      peakRamGiB: 3.2,
      ramLimitGiB: 4,
      peakCpuPct: 87,
      ramStrip: [0.2, 0.3, 0.2, 0.4, 0.6, 0.8, 0.7, 0.5, 0.4],
      cpuStrip: [0.1, 0.2, 0.3, 0.9, 0.4, 0.2, 0.1],
    },
    events: defaultEvents("DEPLOYED"),
  },
  {
    metadata: {
      name: "eval-batch",
      displayName: "Eval Batch",
      externalId: "sbx-2b4d8e3f",
      createdAt: "2026-06-21T09:10:00Z",
      workspace: DEFAULT_WORKSPACE,
      createdBy: { displayName: "alex park", avatarUrl: "https://i.pravatar.cc/40?u=alexpark" },
    },
    spec: {
      image: { name: "blaxel/base:latest", sha: "5a4f1e9d" },
      region: "us-pdx-1",
      memoryMib: 4096,
      ttl: "7d",
      expiresInSec: 6 * 86_400 + 23 * 3_600,
      enabled: true,
      ports: DEFAULT_PORTS,
      runtime: { envs: DEFAULT_ENVS },
      lifecycle: { expirationPolicies: defaultExpirationPolicies("7d") },
      network: { egressMode: "shared" },
      volumes: DEFAULT_VOLUMES,
    },
    status: "DEPLOYED",
    state: "STANDBY",
    lastUsedAt: "2026-06-30T10:46:55Z",
    provenance: {
      source: "job",
      jobName: "nightly-evals",
      jobHref: "/blaxel-demo/jobs/nightly-evals",
      taskIndex: 12,
      taskTotal: 24,
      occurredAt: "2026-06-30T03:00:14Z",
    },
    vitals: {
      requests: { total: 312, status2xx: 308, status4xx: 4, status5xx: 0 },
      peakRamGiB: 1.1,
      ramLimitGiB: 4,
      peakCpuPct: 22,
      ramStrip: [0.2, 0.2, 0.3, 0.2, 0.2, 0.3, 0.2],
      cpuStrip: [0.1, 0.1, 0.2, 0.1, 0.1, 0.1, 0.2],
    },
    events: defaultEvents("DEPLOYED"),
  },
  {
    metadata: {
      name: "browse-pool-01",
      displayName: "Browse pool 01",
      externalId: "sbx-8d2c6f1a",
      createdAt: "2026-06-18T09:38:11Z",
      workspace: DEFAULT_WORKSPACE,
      createdBy: DEFAULT_CREATED_BY,
    },
    spec: {
      image: { name: "playwright/node-20", sha: "1f8a3c0b" },
      region: "eu-lon-1",
      memoryMib: 4096,
      ttl: "30d",
      expiresInSec: 21 * 86_400 + 4 * 3_600,
      enabled: true,
      ports: DEFAULT_PORTS,
      runtime: { envs: DEFAULT_ENVS },
      lifecycle: { expirationPolicies: defaultExpirationPolicies("30d") },
      network: { egressMode: "dedicated" },
      volumes: DEFAULT_VOLUMES,
    },
    status: "DEPLOYED",
    state: "RUNNING",
    lastUsedAt: "2026-06-30T09:00:00Z",
    provenance: {
      source: "cli",
      userEmail: "alex@blaxel.ai",
      command: "bl sandbox create --image playwright/node-20",
      occurredAt: "2026-06-18T09:38:11Z",
    },
    vitals: {
      requests: { total: 1402, status2xx: 1389, status4xx: 11, status5xx: 2 },
      peakRamGiB: 2.7,
      ramLimitGiB: 4,
      peakCpuPct: 54,
      ramStrip: [0.3, 0.5, 0.6, 0.8, 0.7, 0.5, 0.6, 0.7],
      cpuStrip: [0.2, 0.4, 0.6, 0.3, 0.5, 0.4, 0.6, 0.3],
    },
    events: defaultEvents("DEPLOYED"),
  },
  {
    metadata: {
      name: "code-review-ci",
      displayName: "Code review CI",
      externalId: "sbx-4f8b71c2",
      createdAt: "2026-06-17T22:04:00Z",
      workspace: DEFAULT_WORKSPACE,
      createdBy: DEFAULT_CREATED_BY,
    },
    spec: {
      image: { name: "blaxel/node-22", sha: "a4f29c0e" },
      region: "us-was-1",
      memoryMib: 2048,
      ttl: "1d",
      expiresInSec: 19 * 3_600,
      enabled: true,
      ports: DEFAULT_PORTS,
      runtime: { envs: DEFAULT_ENVS },
      lifecycle: { expirationPolicies: defaultExpirationPolicies("1d") },
      network: { egressMode: "shared" },
      volumes: [],
    },
    status: "DEPLOYED",
    state: "STANDBY",
    lastUsedAt: "2026-06-29T14:30:00Z",
    provenance: {
      source: "dashboard",
      userEmail: "kate@blaxel.ai",
      path: "/sandboxes/new",
      occurredAt: "2026-06-17T22:04:00Z",
    },
    vitals: {
      requests: { total: 41, status2xx: 41, status4xx: 0, status5xx: 0 },
      peakRamGiB: 0.8,
      ramLimitGiB: 2,
      peakCpuPct: 14,
      ramStrip: [0.1, 0.1, 0.2, 0.1, 0.1],
      cpuStrip: [0.1, 0.1, 0.1, 0.2, 0.1],
    },
    events: defaultEvents("DEPLOYED"),
  },
  {
    metadata: {
      name: "near-expiry-sbx",
      displayName: "Near-expiry sandbox",
      externalId: "sbx-1c0d77ab",
      createdAt: "2026-06-23T08:00:00Z",
      workspace: DEFAULT_WORKSPACE,
      createdBy: DEFAULT_CREATED_BY,
    },
    spec: {
      image: { name: "blaxel/python-3.12", sha: "9c1e4d6f" },
      region: "eu-fra-1",
      memoryMib: 2048,
      ttl: "1d",
      // < 1h → TTL pill turns warning-grade per §1.1.1
      expiresInSec: 42 * 60 + 18,
      enabled: true,
      ports: DEFAULT_PORTS,
      runtime: { envs: DEFAULT_ENVS },
      lifecycle: { expirationPolicies: defaultExpirationPolicies("1d") },
      network: { egressMode: "shared" },
      volumes: DEFAULT_VOLUMES,
    },
    status: "DEPLOYED",
    state: "RUNNING",
    lastUsedAt: "2026-06-30T05:12:00Z",
    provenance: {
      source: "agent",
      agentName: "support-router",
      agentHref: "/blaxel-demo/agents/support-router",
      sessionId: "ses-92ab0014",
      occurredAt: "2026-06-30T04:55:01Z",
    },
    vitals: {
      requests: { total: 188, status2xx: 184, status4xx: 4, status5xx: 0 },
      peakRamGiB: 1.4,
      ramLimitGiB: 2,
      peakCpuPct: 38,
      ramStrip: [0.2, 0.4, 0.5, 0.6, 0.4, 0.3],
      cpuStrip: [0.1, 0.3, 0.4, 0.2, 0.3, 0.2],
    },
    events: defaultEvents("DEPLOYED"),
  },
  {
    metadata: {
      name: "staging-agent",
      displayName: "staging-agent",
      externalId: "sbx-c1e7a209",
      createdAt: "2026-06-30T10:49:34Z",
      workspace: DEFAULT_WORKSPACE,
      createdBy: { displayName: "alex park", avatarUrl: "https://i.pravatar.cc/40?u=alexpark" },
    },
    spec: {
      image: { name: "blaxel/node-20", sha: "a4f29c0e" },
      region: "eu-lon-1",
      memoryMib: 4096,
      ttl: "1d",
      expiresInSec: 22 * 3_600 + 45 * 60 + 6,
      enabled: false,
      ports: DEFAULT_PORTS,
      runtime: { envs: DEFAULT_ENVS },
      lifecycle: { expirationPolicies: defaultExpirationPolicies("1d") },
      network: { egressMode: "shared" },
      volumes: [],
    },
    status: "FAILED",
    state: "STANDBY",
    failure: {
      cause: "Image pull failed",
      httpStatus: 403,
      lastSuccessfulPull: {
        image: { name: "blaxel/node-20", sha: "9c1e8a4d" },
        occurredAt: "2026-06-27T10:54:34Z",
      },
    },
    lastUsedAt: null,
    provenance: {
      source: "cli",
      userEmail: "alex@blaxel.ai",
      command: "bl sandbox create --image node20",
      occurredAt: "2026-06-30T10:49:34Z",
    },
    vitals: emptyVitals(),
    events: defaultEvents("FAILED"),
  },
  {
    metadata: {
      name: "warmup-pool-02",
      displayName: "Warmup pool 02",
      externalId: "sbx-90b3eaf1",
      createdAt: "2026-06-30T11:01:00Z",
      workspace: DEFAULT_WORKSPACE,
      createdBy: DEFAULT_CREATED_BY,
    },
    spec: {
      image: { name: "blaxel/base:latest", sha: "5a4f1e9d" },
      region: "us-pdx-1",
      memoryMib: 4096,
      ttl: "7d",
      expiresInSec: 5 * 86_400,
      enabled: true,
      ports: DEFAULT_PORTS,
      runtime: { envs: DEFAULT_ENVS },
      lifecycle: { expirationPolicies: defaultExpirationPolicies("7d") },
      network: { egressMode: "shared" },
      volumes: DEFAULT_VOLUMES,
    },
    status: "DEPLOYING",
    state: "STANDBY",
    lastUsedAt: null,
    provenance: {
      source: "dashboard",
      userEmail: "kate@blaxel.ai",
      path: "/sandboxes/new",
      occurredAt: "2026-06-30T11:01:00Z",
    },
    vitals: emptyVitals(),
    events: defaultEvents("DEPLOYING"),
  },
  {
    metadata: {
      name: "old-terminated",
      displayName: "Old terminated",
      externalId: "sbx-7e90bb22",
      createdAt: "2026-05-15T10:00:00Z",
      workspace: DEFAULT_WORKSPACE,
      createdBy: DEFAULT_CREATED_BY,
    },
    spec: {
      image: { name: "blaxel/base:latest", sha: "5a4f1e9d" },
      region: "auto",
      memoryMib: 2048,
      ttl: "none",
      expiresInSec: null,
      enabled: false,
      ports: DEFAULT_PORTS,
      runtime: { envs: [] },
      lifecycle: { expirationPolicies: [] },
      network: { egressMode: "shared" },
      volumes: [],
    },
    status: "TERMINATED",
    state: "STANDBY",
    lastUsedAt: "2026-06-01T08:30:00Z",
    provenance: {
      source: "dashboard",
      userEmail: "kate@blaxel.ai",
      path: "/sandboxes/new",
      occurredAt: "2026-05-15T10:00:00Z",
    },
    vitals: emptyVitals(),
    events: [],
  },
  ...generatedFleet(),
];

const FIXTURES: ReadonlyArray<Sandbox> = RAW_FIXTURES.map((raw) => ({
  ...raw,
  ...tier2Defaults(raw),
}));

// Synthetic fleet for the list-page aggregate strip. The named fixtures above
// (prod-runner, eval-batch, staging-agent, etc.) cover the wireframe's
// state-matrix anchors and are deep-linked from the detail page; this
// generator pads the workspace out to ~80 rows spread across regions,
// images, and states so the §1.3 aggregate tiles have believable shape.
//
// Deterministic — uses a tiny PRNG seeded by index so reloads render the
// same fixtures (no hydration mismatch, screenshots reproducible).
function generatedFleet(): ReadonlyArray<Tier1Sandbox> {
  const REGIONS: ReadonlyArray<SandboxRegion> = [
    "eu-fra-1",
    "us-pdx-1",
    "eu-lon-1",
    "us-was-1",
    "auto",
  ];
  // Weighted region distribution — eu-fra-1 dominant, then us-pdx-1, then the
  // others. Indices into REGIONS; modulus selects.
  const REGION_DIST: ReadonlyArray<number> = [
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1,
    2, 2, 2, 2,
    3, 3,
    4,
  ];
  const IMAGES: ReadonlyArray<SandboxImageRef> = [
    { name: "blaxel/python-3.12", sha: "9c1e4d6f" },
    { name: "blaxel/node-20", sha: "a4f29c0e" },
    { name: "blaxel/base", sha: "5a4f1e9d" },
    { name: "blaxel/node-22", sha: "3d7f12b8" },
    { name: "playwright/node-20", sha: "1f8a3c0b" },
    { name: "blaxel/expo", sha: "7b2e88aa" },
  ];
  const IMAGE_DIST: ReadonlyArray<number> = [
    0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1,
    2, 2, 2, 2,
    3, 3, 3,
    4, 4,
    5,
  ];
  // Status × state recipe — RUNNING and STANDBY dominate. A handful of
  // FAILED / DEPLOYING / TERMINATED rows to give the Status filter signal
  // in every category.
  const RECIPES: ReadonlyArray<{
    status: SandboxDeploymentStatus;
    state: SandboxRuntimeState;
  }> = [
    ...Array.from({ length: 20 }, () => ({
      status: "DEPLOYED" as const,
      state: "RUNNING" as const,
    })),
    ...Array.from({ length: 18 }, () => ({
      status: "DEPLOYED" as const,
      state: "STANDBY" as const,
    })),
    { status: "FAILED", state: "STANDBY" },
    { status: "FAILED", state: "STANDBY" },
    { status: "FAILED", state: "RUNNING" },
    { status: "DEPLOYING", state: "STANDBY" },
    { status: "DEPLOYING", state: "STANDBY" },
    { status: "TERMINATED", state: "STANDBY" },
    { status: "TERMINATED", state: "STANDBY" },
  ];
  const TTL_BUCKETS: ReadonlyArray<{
    ttl: Sandbox["spec"]["ttl"];
    expiresInSec: number | null;
  }> = [
    { ttl: "none", expiresInSec: null },
    { ttl: "none", expiresInSec: null },
    { ttl: "1d", expiresInSec: 19 * 3_600 },
    { ttl: "7d", expiresInSec: 5 * 86_400 + 6 * 3_600 },
    { ttl: "7d", expiresInSec: 2 * 86_400 + 11 * 3_600 },
    { ttl: "30d", expiresInSec: 21 * 86_400 + 4 * 3_600 },
    { ttl: "30d", expiresInSec: 12 * 86_400 },
  ];
  // Stable hash so id+name stay byte-identical across SSR/CSR.
  function hash8(seed: number): string {
    let h = seed * 2_654_435_761;
    h = (h ^ (h >>> 13)) >>> 0;
    return h.toString(16).padStart(8, "0").slice(0, 8);
  }

  const fleet: Array<Tier1Sandbox> = [];
  for (let i = 0; i < 70; i += 1) {
    const region = REGIONS[REGION_DIST[i % REGION_DIST.length]!]!;
    const image = IMAGES[IMAGE_DIST[i % IMAGE_DIST.length]!]!;
    const recipe = RECIPES[i % RECIPES.length]!;
    const ttlBucket = TTL_BUCKETS[i % TTL_BUCKETS.length]!;
    const externalId = `sbx-${hash8(i + 101)}`;
    const name = `${image.name.split("/")[1] ?? "sbx"}-${hash8(i + 202).slice(0, 6)}`;
    const isTerminated =
      recipe.status === "TERMINATED" || recipe.status === "DELETING";
    const isFailed = recipe.status === "FAILED";
    fleet.push({
      metadata: {
        name,
        displayName: name,
        externalId,
        createdAt: "2026-06-20T10:00:00Z",
        workspace: DEFAULT_WORKSPACE,
        createdBy: DEFAULT_CREATED_BY,
      },
      spec: {
        image,
        region,
        memoryMib: recipe.status === "DEPLOYING" ? 4096 : 2048,
        ttl: isTerminated ? "none" : ttlBucket.ttl,
        expiresInSec: isTerminated ? null : ttlBucket.expiresInSec,
        enabled: !isTerminated && !isFailed,
        ports: DEFAULT_PORTS,
        runtime: { envs: DEFAULT_ENVS },
        lifecycle: {
          expirationPolicies: isTerminated
            ? []
            : defaultExpirationPolicies(ttlBucket.ttl),
        },
        network: { egressMode: "shared" },
        volumes: i % 3 === 0 ? DEFAULT_VOLUMES : [],
      },
      status: recipe.status,
      state: recipe.state,
      failure: isFailed
        ? {
            cause: "Image pull failed",
            httpStatus: 403,
            lastSuccessfulPull: {
              image,
              occurredAt: "2026-06-17T10:00:00Z",
            },
          }
        : undefined,
      lastUsedAt: isTerminated ? null : "2026-06-29T12:00:00Z",
      provenance: {
        source: "agent",
        agentName: "synthetic-agent",
        agentHref: `/${DEFAULT_WORKSPACE}/agents/synthetic-agent`,
        sessionId: `ses-${externalId.slice(4)}`,
        occurredAt: "2026-06-20T10:00:00Z",
      },
      vitals: emptyVitals(),
      events: defaultEvents(recipe.status),
    });
  }
  return fleet;
}

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
  nameOrId: string,
): Promise<Sandbox | null> {
  void _accountId;
  void _workspaceId;
  return (
    FIXTURES.find(
      (s) => s.metadata.name === nameOrId || s.metadata.externalId === nameOrId,
    ) ?? null
  );
}

export type ExtendTtlStep = "+1h" | "+24h" | "+7d" | "none";

/** Mock action — extends a sandbox's TTL by the canonical step. Demo mode:
 * resolves after a short delay so the UI can show a pending state. */
export async function extendSandboxTtl(
  _accountId: string,
  _workspaceId: string,
  name: string,
  step: ExtendTtlStep,
): Promise<{ ok: true; name: string; step: ExtendTtlStep }> {
  void _accountId;
  void _workspaceId;
  await new Promise((resolve) => setTimeout(resolve, 240));
  return { ok: true, name, step };
}
