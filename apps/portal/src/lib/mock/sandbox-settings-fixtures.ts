// Settings-tab demo fixtures for the sandbox detail surface. Modelled
// alongside the canonical Sandbox shape in `./sandboxes.ts` — kept in a
// separate file so the four parallel tab-content agents don't collide on
// the same source. Only the Settings tab consumes this fixture; Overview
// reads `Sandbox` itself.

import type { SandboxRegion } from "./sandboxes";

export interface SandboxAuditUser {
  displayName: string;
  email: string;
  avatarUrl: string;
}

export interface SandboxLifecyclePolicy {
  /** Short heading: "TTL idle", "Max runtime", … */
  name: string;
  /** One-line operative description: "Delete after 24h idle". */
  description: string;
}

export interface SandboxPreview {
  name: string;
  url: string;
  port: number;
  access: "public" | "private" | "team";
  expiresAt: string | null;
}

export interface SandboxAttachedPolicyRef {
  name: string;
  href: string;
  /** One-line: "EU regions only, standard CPU, 1M tokens/hr". */
  summary: string;
}

export interface SandboxLabel {
  key: string;
  value: string;
}

/** Shape of the Settings-tab demo overlay. The Sandbox identity (name +
 *  region etc.) comes from the canonical Sandbox query; everything here is
 *  Settings-only material the Overview surface does not consume. */
export interface SandboxSettings {
  /** Display name + Description are the only inline-editable fields on the
   *  Settings tab. Description has no slot on the canonical Sandbox shape,
   *  so it lives here. */
  description: string;
  audit: {
    createdBy: SandboxAuditUser;
    updatedBy: SandboxAuditUser;
    createdAt: string;
    updatedAt: string;
  };
  deploymentId: string;
  lifecyclePolicies: ReadonlyArray<SandboxLifecyclePolicy>;
  /** Absolute ISO; null when ttl="none" or sandbox has no scheduled
   *  termination. Rendered in local time per wireframe §3 Settings. */
  terminationAt: string | null;
  previews: ReadonlyArray<SandboxPreview>;
  /** Reference to the volume names also rendered on Overview Storage band —
   *  Settings shows the read-only list, deep links back to Storage. */
  volumesAttached: ReadonlyArray<{ name: string; href: string; region: SandboxRegion }>;
  policies: ReadonlyArray<SandboxAttachedPolicyRef>;
  labels: ReadonlyArray<SandboxLabel>;
}

const DEFAULT_CREATED_BY: SandboxAuditUser = {
  displayName: "Xu Zy",
  email: "xu@blaxel.ai",
  avatarUrl: "https://i.pravatar.cc/40?u=xuzy",
};

const DEFAULT_UPDATED_BY: SandboxAuditUser = {
  displayName: "Alex Park",
  email: "alex@blaxel.ai",
  avatarUrl: "https://i.pravatar.cc/40?u=alexpark",
};

const DEFAULT_LIFECYCLE_POLICIES: ReadonlyArray<SandboxLifecyclePolicy> = [
  { name: "TTL idle", description: "Delete after 24h idle." },
  { name: "Max runtime", description: "Deactivate after 7d total runtime." },
];

const DEFAULT_LABELS: ReadonlyArray<SandboxLabel> = [
  { key: "env", value: "staging" },
  { key: "team", value: "agents-platform" },
  { key: "owner", value: "alex" },
];

const DEFAULT_POLICIES: ReadonlyArray<SandboxAttachedPolicyRef> = [
  {
    name: "prod-eu-only",
    href: "/blaxel-demo/policies/prod-eu-only",
    summary: "EU regions only · standard CPU · 1M tokens/hr",
  },
];

const DEFAULT_PREVIEWS: ReadonlyArray<SandboxPreview> = [
  {
    name: "preview",
    url: "https://sbx-next-js-epzkrc.us-pdx-1.bl.run",
    port: 3000,
    access: "team",
    expiresAt: "2026-07-07T12:00:00Z",
  },
  {
    name: "sandbox-api",
    url: "https://sbx-next-js-epzkrc.us-pdx-1.bl.run:8080",
    port: 8080,
    access: "private",
    expiresAt: null,
  },
];

const DEFAULT_VOLUMES: ReadonlyArray<{ name: string; href: string; region: SandboxRegion }> = [
  {
    name: "vol-conversations",
    href: "/blaxel-demo/volumes/vol-conversations",
    region: "us-pdx-1",
  },
];

/** Fixed deterministic settings overlay. The Sandbox detail layout's query
 *  already populates the canonical Sandbox; this overlay is keyed by
 *  sandbox name so the Settings tab can render rich-shape data without
 *  forcing the canonical fixture to grow. Any unknown name falls back to
 *  the canonical "next-js" demo overlay so the Settings tab is always
 *  populated in demo mode. */
const SETTINGS_BY_NAME: Record<string, SandboxSettings> = {
  "next-js": {
    description:
      "Next.js preview environment for the email-triage agent. Restarted hourly by the warm-pool maintainer.",
    audit: {
      createdBy: DEFAULT_CREATED_BY,
      updatedBy: DEFAULT_UPDATED_BY,
      createdAt: "2026-06-30T08:42:00Z",
      updatedAt: "2026-06-30T10:54:34Z",
    },
    deploymentId: "9cdf10e6a9a7515243436aa129277b1b",
    lifecyclePolicies: DEFAULT_LIFECYCLE_POLICIES,
    terminationAt: "2026-07-01T07:27:06Z",
    previews: DEFAULT_PREVIEWS,
    volumesAttached: [
      ...DEFAULT_VOLUMES,
      {
        name: "vol-eu-cache",
        href: "/blaxel-demo/volumes/vol-eu-cache",
        region: "eu-fra-1",
      },
    ],
    policies: DEFAULT_POLICIES,
    labels: DEFAULT_LABELS,
  },
};

const FALLBACK_SETTINGS: SandboxSettings = SETTINGS_BY_NAME["next-js"]!;

export async function fetchSandboxSettings(
  _accountId: string,
  _workspaceId: string,
  name: string,
): Promise<SandboxSettings> {
  void _accountId;
  void _workspaceId;
  return SETTINGS_BY_NAME[name] ?? FALLBACK_SETTINGS;
}

/** Mock mutation — saves Display name / Description edits. Demo mode: a
 *  short delay so the UI can show a pending state. The canonical fixture
 *  is read-only; the caller is responsible for echoing the saved value
 *  back into its own component state. */
export async function saveSandboxIdentity(
  _accountId: string,
  _workspaceId: string,
  name: string,
  patch: { displayName?: string; description?: string },
): Promise<{ ok: true; name: string; patch: typeof patch }> {
  void _accountId;
  void _workspaceId;
  await new Promise((resolve) => setTimeout(resolve, 240));
  return { ok: true, name, patch };
}
