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
  | "DEACTIVATING"
  | "DEACTIVATED"
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
  /** Failure reason for FAILED rows — drives the inline recovery band. */
  failureReason?: string;
  /** ISO timestamp; null when never touched (fresh deploy). */
  lastUsedAt: string | null;
  provenance: SandboxProvenance;
  vitals: SandboxVitals;
  events: ReadonlyArray<SandboxEvent>;
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

// Named fixtures cover the wireframe's state-matrix anchors (Active, Standby,
// Errored, Deploying, Terminated, plus warning-state TTL). Each is deep-linked
// from the list page; each lights up a different combination of bands in
// `[name]` detail.
const FIXTURES: ReadonlyArray<Sandbox> = [
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
    failureReason: "Image pull failed — push Image or pick another.",
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
      name: "deactivating-runner",
      displayName: "Deactivating runner",
      externalId: "sbx-3411af09",
      createdAt: "2026-06-10T10:00:00Z",
      workspace: DEFAULT_WORKSPACE,
      createdBy: DEFAULT_CREATED_BY,
    },
    spec: {
      image: { name: "blaxel/node-22", sha: "a4f29c0e" },
      region: "us-was-1",
      memoryMib: 2048,
      ttl: "30d",
      expiresInSec: 12 * 86_400,
      enabled: false,
      ports: DEFAULT_PORTS,
      runtime: { envs: DEFAULT_ENVS },
      lifecycle: { expirationPolicies: defaultExpirationPolicies("30d") },
      network: { egressMode: "shared" },
      volumes: DEFAULT_VOLUMES,
    },
    status: "DEACTIVATING",
    state: "STANDBY",
    lastUsedAt: "2026-06-25T11:00:00Z",
    provenance: {
      source: "cli",
      userEmail: "alex@blaxel.ai",
      command: "bl sandbox create --image node22",
      occurredAt: "2026-06-10T10:00:00Z",
    },
    vitals: {
      requests: { total: 9, status2xx: 9, status4xx: 0, status5xx: 0 },
      peakRamGiB: 0.4,
      ramLimitGiB: 2,
      peakCpuPct: 6,
      ramStrip: [0.1, 0.1, 0.1, 0.1, 0.1],
      cpuStrip: [0.1, 0.1, 0.1, 0.1, 0.1],
    },
    events: defaultEvents("DEPLOYED"),
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

// Synthetic fleet for the list-page aggregate strip. The named fixtures above
// (prod-runner, eval-batch, staging-agent, etc.) cover the wireframe's
// state-matrix anchors and are deep-linked from the detail page; this
// generator pads the workspace out to ~80 rows spread across regions,
// images, and states so the §1.3 aggregate tiles have believable shape.
//
// Deterministic — uses a tiny PRNG seeded by index so reloads render the
// same fixtures (no hydration mismatch, screenshots reproducible).
function generatedFleet(): ReadonlyArray<Sandbox> {
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
  // FAILED / DEPLOYING / DEACTIVATING / TERMINATED rows to give the strip
  // signal in every category.
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
    { status: "DEACTIVATING", state: "STANDBY" },
    { status: "DEACTIVATED", state: "STANDBY" },
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

  const fleet: Array<Sandbox> = [];
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
      failureReason: isFailed
        ? "Image pull failed — push Image or pick another."
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
