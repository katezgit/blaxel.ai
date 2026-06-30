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

export interface Sandbox {
  metadata: {
    name: string;
    displayName: string;
    externalId: string;
    createdAt: string;
    workspace: string;
  };
  spec: {
    image: SandboxImageRef;
    region: SandboxRegion;
    memoryMib: number;
    ttl: "none" | "1d" | "7d" | "30d";
    /** Seconds until expiry; null when ttl="none". */
    expiresInSec: number | null;
    enabled: boolean;
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

const FIXTURES: ReadonlyArray<Sandbox> = [
  {
    metadata: {
      name: "prod-runner",
      displayName: "prod-runner",
      externalId: "sbx-7f3a9c1e",
      createdAt: "2026-06-12T14:00:00Z",
      workspace: DEFAULT_WORKSPACE,
    },
    spec: {
      image: { name: "blaxel/python-3.12", sha: "9c1e4d6f" },
      region: "eu-fra-1",
      memoryMib: 2048,
      ttl: "none",
      expiresInSec: null,
      enabled: true,
      runtime: {
        envs: [
          { name: "OPENAI_API_KEY", value: "sk-live-9d2f4a1b7c3e8a", secret: true },
          { name: "STRIPE_API_KEY", value: "sk-live-stripe-abc123", secret: true },
          { name: "LOG_LEVEL", value: "info", secret: false },
        ],
      },
      lifecycle: { expirationPolicies: [] },
      network: { egressMode: "dedicated" },
      volumes: [
        { name: "agent-drive", mountPath: "/mnt/data", readOnly: false },
        { name: "shared-models", mountPath: "/mnt/models", readOnly: true },
      ],
    },
    status: "DEPLOYED",
    state: "RUNNING",
    lastUsedAt: "2026-06-30T08:42:11Z",
    events: defaultEvents("DEPLOYED"),
  },
  {
    metadata: {
      name: "eval-batch",
      displayName: "eval-batch",
      externalId: "sbx-2b4d8e3f",
      createdAt: "2026-06-21T09:10:00Z",
      workspace: DEFAULT_WORKSPACE,
    },
    spec: {
      image: { name: "blaxel/base", sha: "5a4f1e9d" },
      region: "us-pdx-1",
      memoryMib: 4096,
      ttl: "7d",
      expiresInSec: 6 * 86_400 + 23 * 3_600,
      enabled: true,
      runtime: { envs: DEFAULT_ENVS },
      lifecycle: { expirationPolicies: defaultExpirationPolicies("7d") },
      network: { egressMode: "shared" },
      volumes: DEFAULT_VOLUMES,
    },
    status: "DEPLOYED",
    state: "STANDBY",
    lastUsedAt: "2026-06-28T18:04:00Z",
    events: defaultEvents("DEPLOYED"),
  },
  {
    metadata: {
      name: "browse-pool-01",
      displayName: "browse-pool-01",
      externalId: "sbx-8d2c6f1a",
      createdAt: "2026-06-18T09:38:11Z",
      workspace: DEFAULT_WORKSPACE,
    },
    spec: {
      image: { name: "playwright/node-20", sha: "1f8a3c0b" },
      region: "eu-lon-1",
      memoryMib: 4096,
      ttl: "30d",
      expiresInSec: 21 * 86_400 + 4 * 3_600,
      enabled: true,
      runtime: { envs: DEFAULT_ENVS },
      lifecycle: { expirationPolicies: defaultExpirationPolicies("30d") },
      network: { egressMode: "dedicated" },
      volumes: DEFAULT_VOLUMES,
    },
    status: "DEPLOYED",
    state: "RUNNING",
    lastUsedAt: "2026-06-30T09:00:00Z",
    events: defaultEvents("DEPLOYED"),
  },
  {
    metadata: {
      name: "code-review-ci",
      displayName: "code-review-ci",
      externalId: "sbx-4f8b71c2",
      createdAt: "2026-06-17T22:04:00Z",
      workspace: DEFAULT_WORKSPACE,
    },
    spec: {
      image: { name: "blaxel/node-22", sha: "a4f29c0e" },
      region: "us-was-1",
      memoryMib: 2048,
      ttl: "1d",
      expiresInSec: 19 * 3_600,
      enabled: true,
      runtime: { envs: DEFAULT_ENVS },
      lifecycle: { expirationPolicies: defaultExpirationPolicies("1d") },
      network: { egressMode: "shared" },
      volumes: [],
    },
    status: "DEPLOYED",
    state: "STANDBY",
    lastUsedAt: "2026-06-29T14:30:00Z",
    events: defaultEvents("DEPLOYED"),
  },
  {
    metadata: {
      name: "near-expiry-sbx",
      displayName: "near-expiry-sbx",
      externalId: "sbx-1c0d77ab",
      createdAt: "2026-06-23T08:00:00Z",
      workspace: DEFAULT_WORKSPACE,
    },
    spec: {
      image: { name: "blaxel/python-3.12", sha: "9c1e4d6f" },
      region: "eu-fra-1",
      memoryMib: 2048,
      ttl: "1d",
      // < 24h → expires-in column turns warning
      expiresInSec: 3 * 3_600 + 14 * 60,
      enabled: true,
      runtime: { envs: DEFAULT_ENVS },
      lifecycle: { expirationPolicies: defaultExpirationPolicies("1d") },
      network: { egressMode: "shared" },
      volumes: DEFAULT_VOLUMES,
    },
    status: "DEPLOYED",
    state: "RUNNING",
    lastUsedAt: "2026-06-30T05:12:00Z",
    events: defaultEvents("DEPLOYED"),
  },
  {
    metadata: {
      name: "staging-agent",
      displayName: "staging-agent",
      externalId: "sbx-c1e7a209",
      createdAt: "2026-06-22T11:20:00Z",
      workspace: DEFAULT_WORKSPACE,
    },
    spec: {
      image: { name: "blaxel/node-20", sha: "a4f29c0e" },
      region: "eu-lon-1",
      memoryMib: 2048,
      ttl: "none",
      expiresInSec: null,
      enabled: false,
      runtime: { envs: DEFAULT_ENVS },
      lifecycle: { expirationPolicies: [] },
      network: { egressMode: "shared" },
      volumes: [],
    },
    status: "FAILED",
    state: "STANDBY",
    failureReason: "Image pull failed — push Image or pick another.",
    lastUsedAt: null,
    events: defaultEvents("FAILED"),
  },
  {
    metadata: {
      name: "warmup-pool-02",
      displayName: "warmup-pool-02",
      externalId: "sbx-90b3eaf1",
      createdAt: "2026-06-23T14:00:00Z",
      workspace: DEFAULT_WORKSPACE,
    },
    spec: {
      image: { name: "blaxel/base", sha: "5a4f1e9d" },
      region: "us-pdx-1",
      memoryMib: 4096,
      ttl: "7d",
      expiresInSec: 5 * 86_400,
      enabled: true,
      runtime: { envs: DEFAULT_ENVS },
      lifecycle: { expirationPolicies: defaultExpirationPolicies("7d") },
      network: { egressMode: "shared" },
      volumes: DEFAULT_VOLUMES,
    },
    status: "DEPLOYING",
    state: "STANDBY",
    lastUsedAt: null,
    events: defaultEvents("DEPLOYING"),
  },
  {
    metadata: {
      name: "deactivating-runner",
      displayName: "deactivating-runner",
      externalId: "sbx-3411af09",
      createdAt: "2026-06-10T10:00:00Z",
      workspace: DEFAULT_WORKSPACE,
    },
    spec: {
      image: { name: "blaxel/node-22", sha: "a4f29c0e" },
      region: "us-was-1",
      memoryMib: 2048,
      ttl: "30d",
      expiresInSec: 12 * 86_400,
      enabled: false,
      runtime: { envs: DEFAULT_ENVS },
      lifecycle: { expirationPolicies: defaultExpirationPolicies("30d") },
      network: { egressMode: "shared" },
      volumes: DEFAULT_VOLUMES,
    },
    status: "DEACTIVATING",
    state: "STANDBY",
    lastUsedAt: "2026-06-25T11:00:00Z",
    events: defaultEvents("DEPLOYED"),
  },
  {
    metadata: {
      name: "old-terminated",
      displayName: "old-terminated",
      externalId: "sbx-7e90bb22",
      createdAt: "2026-05-15T10:00:00Z",
      workspace: DEFAULT_WORKSPACE,
    },
    spec: {
      image: { name: "blaxel/base", sha: "5a4f1e9d" },
      region: "auto",
      memoryMib: 2048,
      ttl: "none",
      expiresInSec: null,
      enabled: false,
      runtime: { envs: [] },
      lifecycle: { expirationPolicies: [] },
      network: { egressMode: "shared" },
      volumes: [],
    },
    status: "TERMINATED",
    state: "STANDBY",
    lastUsedAt: "2026-06-01T08:30:00Z",
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
      },
      spec: {
        image,
        region,
        memoryMib: recipe.status === "DEPLOYING" ? 4096 : 2048,
        ttl: isTerminated ? "none" : ttlBucket.ttl,
        expiresInSec: isTerminated ? null : ttlBucket.expiresInSec,
        enabled: !isTerminated && !isFailed,
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
