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
