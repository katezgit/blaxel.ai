/**
 * Policy mock fixtures. Shape mirrors the Blaxel Policy API
 * (https://docs.blaxel.ai/api-reference/policies) — typed fixtures are the
 * contract that a future client will swap in. Two endpoints stay distinct:
 *
 *   - `Policy.usage`         — integer counts on the Policy resource itself
 *                              (`PolicyUsageCounts`), source for the list page
 *                              "Usage" column and the detail page band 3
 *                              collapsed counts.
 *   - `GET /policies/{name}/usages` (`fetchPolicyUsages`) — named workload
 *                              objects per kind, source for band 3 expanded
 *                              rows on detail page.
 *
 * Combination semantics (UNION within `spec.type`, INTERSECTION across types)
 * are docs-defined properties of the system, not fields on the Policy — they
 * are surfaced in UI as static annotations.
 */

export type PolicyType = "location" | "flavor" | "maxToken";

export type PolicyResourceType =
  | "agent"
  | "model"
  | "function"
  | "sandbox"
  | "application";

export interface PolicyLocation {
  type: "continent" | "country";
  name: string;
}

export interface PolicyFlavor {
  name: string;
  type: "cpu" | "gpu";
}

export type MaxTokenGranularity = "month" | "day" | "hour" | "minute";

export interface PolicyMaxTokens {
  granularity: MaxTokenGranularity;
  step: number;
  /** 0 = not evaluated. */
  input: number;
  /** 0 = not evaluated. */
  output: number;
  /** 0 = not evaluated. */
  total: number;
  /** 0 = not evaluated. */
  ratioInputOverOutput: number;
}

export interface PolicyMetadata {
  /** Canonical id used in `bl` commands and `spec.policies[]` on workloads. */
  name: string;
  displayName: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  workspace: string;
  /** Object of label keys -> values; surfaced as `key:value` chips. */
  labels: Record<string, string>;
}

/**
 * `PolicyUsageCounts` on the Policy resource itself. Integer counts only —
 * the names live behind `GET /policies/{name}/usages`.
 */
export interface PolicyUsageCounts {
  agents: number;
  functions: number;
  jobs: number;
  models: number;
  sandboxes: number;
}

export interface PolicySpec {
  type: PolicyType;
  resourceTypes: ReadonlyArray<PolicyResourceType>;
  locations?: ReadonlyArray<PolicyLocation>;
  flavors?: ReadonlyArray<PolicyFlavor>;
  maxTokens?: PolicyMaxTokens;
}

export interface Policy {
  metadata: PolicyMetadata;
  spec: PolicySpec;
  usage: PolicyUsageCounts;
}

/** A single workload reference; same shape returned per kind by `/usages`. */
export interface PolicyUsageWorkload {
  /** Canonical workload id. */
  name: string;
  /** Other policy names attached to this workload (for adjacency rendering). */
  peerPolicies: ReadonlyArray<string>;
}

/**
 * `PolicyUsages` returned by `GET /policies/{name}/usages`.
 * Arrays of objects per kind — populated only when count > 0.
 */
export interface PolicyUsages {
  agents: ReadonlyArray<PolicyUsageWorkload>;
  functions: ReadonlyArray<PolicyUsageWorkload>;
  jobs: ReadonlyArray<PolicyUsageWorkload>;
  models: ReadonlyArray<PolicyUsageWorkload>;
  sandboxes: ReadonlyArray<PolicyUsageWorkload>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const FIXTURES: Array<Policy> = [
  {
    metadata: {
      name: "pol-7a3f",
      displayName: "eu-only-prod",
      createdAt: "2026-06-20T14:33:00Z",
      createdBy: "kate@cubic.dev",
      updatedAt: "2026-06-21T09:12:00Z",
      updatedBy: "alex@cubic.dev",
      workspace: "cubic-prod",
      labels: { compliance: "hipaa", env: "prod" },
    },
    spec: {
      type: "location",
      resourceTypes: ["agent", "model", "sandbox"],
      locations: [
        { type: "continent", name: "North America" },
        { type: "country", name: "United States" },
        { type: "country", name: "Germany" },
        { type: "country", name: "France" },
      ],
    },
    usage: { agents: 3, functions: 0, jobs: 0, models: 0, sandboxes: 1 },
  },
  {
    metadata: {
      name: "pol-2c1e",
      displayName: "token-cap-gpt4",
      createdAt: "2026-06-18T11:00:00Z",
      createdBy: "alex@cubic.dev",
      updatedAt: "2026-06-18T11:00:00Z",
      updatedBy: "alex@cubic.dev",
      workspace: "cubic-prod",
      labels: {},
    },
    spec: {
      type: "maxToken",
      resourceTypes: ["model", "agent", "function"],
      maxTokens: {
        granularity: "month",
        step: 1,
        input: 1_000_000,
        output: 0,
        total: 2_000_000,
        ratioInputOverOutput: 0,
      },
    },
    usage: { agents: 2, functions: 0, jobs: 0, models: 1, sandboxes: 0 },
  },
  {
    metadata: {
      name: "pol-9b4d",
      displayName: "gpu-flavor-staging",
      createdAt: "2026-06-15T08:45:00Z",
      createdBy: "sam@webflow.com",
      updatedAt: "2026-06-15T08:45:00Z",
      updatedBy: "sam@webflow.com",
      workspace: "cubic-prod",
      labels: { env: "staging" },
    },
    spec: {
      type: "flavor",
      resourceTypes: ["agent"],
      flavors: [
        { name: "t4", type: "cpu" },
        { name: "x86-standard", type: "cpu" },
      ],
    },
    usage: { agents: 2, functions: 0, jobs: 0, models: 0, sandboxes: 0 },
  },
  {
    metadata: {
      name: "pol-4d2a",
      displayName: "us-only-sandboxes",
      createdAt: "2026-05-02T10:15:00Z",
      createdBy: "alex@cubic.dev",
      updatedAt: "2026-05-02T10:15:00Z",
      updatedBy: "alex@cubic.dev",
      workspace: "cubic-prod",
      labels: { env: "prod" },
    },
    spec: {
      type: "location",
      resourceTypes: ["sandbox"],
      locations: [{ type: "country", name: "United States" }],
    },
    // Zero usage across all kinds — surfaces the "safe to delete" signal.
    usage: { agents: 0, functions: 0, jobs: 0, models: 0, sandboxes: 0 },
  },
];

const USAGES: Record<string, PolicyUsages> = {
  "pol-7a3f": {
    agents: [
      {
        name: "cubic-prod-agent",
        peerPolicies: ["token-cap-gpt4"],
      },
      {
        name: "webflow-content-agent",
        peerPolicies: ["token-cap-gpt4"],
      },
      {
        name: "staging-v2-agent",
        peerPolicies: [],
      },
    ],
    functions: [],
    jobs: [],
    models: [],
    sandboxes: [{ name: "sbx-9c1e", peerPolicies: [] }],
  },
  "pol-2c1e": {
    agents: [
      { name: "cubic-prod-agent", peerPolicies: ["eu-only-prod"] },
      { name: "staging-v2-agent", peerPolicies: [] },
    ],
    functions: [],
    jobs: [],
    models: [{ name: "prod-openai-chat", peerPolicies: [] }],
    sandboxes: [],
  },
  "pol-9b4d": {
    agents: [
      { name: "staging-agent-v1", peerPolicies: [] },
      { name: "staging-agent-v2", peerPolicies: [] },
    ],
    functions: [],
    jobs: [],
    models: [],
    sandboxes: [],
  },
  "pol-4d2a": {
    agents: [],
    functions: [],
    jobs: [],
    models: [],
    sandboxes: [],
  },
};

// Simulate a network round-trip so loading/error states aren't pre-empted
// by an instant Promise resolution. Kept small so dev iteration stays snappy.
const NETWORK_LATENCY_MS = 220;
function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), NETWORK_LATENCY_MS));
}

// In-memory set of policy names removed via `deletePolicy`. Mock-side only —
// resets on full reload. `fetchPolicies` and `fetchPolicy` consult this set so
// optimistic invalidation actually sees the row drop out.
const DELETED_NAMES = new Set<string>();

export async function fetchPolicies(
  _accountId: string,
  _workspaceId: string,
): Promise<ReadonlyArray<Policy>> {
  void _accountId;
  void _workspaceId;
  return delay(FIXTURES.filter((policy) => !DELETED_NAMES.has(policy.metadata.name)));
}

export async function fetchPolicy(
  _accountId: string,
  _workspaceId: string,
  name: string,
): Promise<Policy | null> {
  void _accountId;
  void _workspaceId;
  if (DELETED_NAMES.has(name)) return delay(null);
  const match = FIXTURES.find((policy) => policy.metadata.name === name);
  return delay(match ?? null);
}

// Mock-side delete. Sync return (no `delay`) keeps the caller's optimistic flow
// uncluttered — the round-trip illusion belongs to the *read* refetch, not the
// write itself.
export function deletePolicy(
  _accountId: string,
  _workspaceId: string,
  name: string,
): void {
  void _accountId;
  void _workspaceId;
  DELETED_NAMES.add(name);
}

// Mock-side patch. Mutates the fixture in place so subsequent reads see the
// new values. Async + delay so the optimistic flow exercises a real loading
// state on submit.
export interface PolicyUpdatePatch {
  displayName: string;
  resourceTypes: ReadonlyArray<PolicyResourceType>;
  locations?: ReadonlyArray<PolicyLocation>;
  maxTokens?: PolicyMaxTokens;
  updatedBy: string;
}

export async function updatePolicy(
  _accountId: string,
  _workspaceId: string,
  name: string,
  patch: PolicyUpdatePatch,
): Promise<Policy | null> {
  void _accountId;
  void _workspaceId;
  const idx = FIXTURES.findIndex(
    (p) => p.metadata.name === name,
  );
  const current = FIXTURES[idx];
  if (idx === -1 || current === undefined) return delay(null);
  const nextSpec: PolicySpec = {
    ...current.spec,
    resourceTypes: patch.resourceTypes,
    ...(patch.locations !== undefined ? { locations: patch.locations } : {}),
    ...(patch.maxTokens !== undefined ? { maxTokens: patch.maxTokens } : {}),
  };
  const next: Policy = {
    metadata: {
      ...current.metadata,
      displayName: patch.displayName,
      updatedAt: new Date().toISOString(),
      updatedBy: patch.updatedBy,
    },
    spec: nextSpec,
    usage: current.usage,
  };
  FIXTURES[idx] = next;
  return delay(next);
}

export async function fetchPolicyUsages(
  _accountId: string,
  _workspaceId: string,
  name: string,
): Promise<PolicyUsages | null> {
  void _accountId;
  void _workspaceId;
  return delay(USAGES[name] ?? null);
}

// ─────────────────────────────────────────────────────────────────────────────
// Display helpers — pure, used by both list and detail surfaces. App-level
// vocab decisions live here (resourceType -> label, granularity -> word).
// ─────────────────────────────────────────────────────────────────────────────

const RESOURCE_TYPE_LABEL: Record<PolicyResourceType, string> = {
  agent: "Agents",
  model: "Model APIs",
  function: "MCP Servers",
  sandbox: "Sandboxes",
  application: "Applications",
};

export function resourceTypeLabel(value: PolicyResourceType): string {
  return RESOURCE_TYPE_LABEL[value];
}

export function joinResourceTypes(
  values: ReadonlyArray<PolicyResourceType>,
): string {
  return values.map(resourceTypeLabel).join(" · ");
}

const POLICY_TYPE_LABEL: Record<PolicyType, string> = {
  location: "Location",
  flavor: "Flavor",
  maxToken: "Token usage",
};

export function policyTypeLabel(value: PolicyType): string {
  return POLICY_TYPE_LABEL[value];
}

export function totalUsage(usage: PolicyUsageCounts): number {
  return (
    usage.agents + usage.functions + usage.jobs + usage.models + usage.sandboxes
  );
}
