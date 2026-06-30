/**
 * Notification fixtures for the topbar bell + popover.
 *
 * Categories trace `docs/design/patterns/notifications.md` event taxonomy:
 *   - async-outcome     — job completion/failure, agent health flips, deploy outcomes
 *   - threshold         — TTL/expiry/quota warnings that gate the next action
 *   - collaboration     — workspace invitations
 *   - security          — API key + service account changes
 *
 * Timestamps are absolute ISO strings sampled relative to MOCK_NOW so the
 * "X ago" display stays deterministic regardless of when the demo is opened.
 */

export type NotificationCategory =
  | "async-outcome"
  | "threshold"
  | "collaboration"
  | "security";

export interface Notification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  /** ISO 8601 UTC. */
  timestamp: string;
  read: boolean;
  /** Canonical detail-page route. Workspace-scoped routes use the current workspace slug. */
  href?: string;
}

/**
 * Anchor "now" for relative-time rendering. Frozen so demo screenshots reproduce.
 * Matches the project's currentDate context (2026-06-19).
 */
const MOCK_NOW = new Date("2026-06-19T15:30:00Z");

function minutesAgo(min: number): string {
  return new Date(MOCK_NOW.getTime() - min * 60_000).toISOString();
}

function hoursAgo(h: number): string {
  return minutesAgo(h * 60);
}

function daysAgo(d: number): string {
  return minutesAgo(d * 60 * 24);
}

const WORKSPACE_SLUG = "astra-prod";

const FIXTURES: ReadonlyArray<Notification> = [
  {
    id: "ntf_job_finetune_failed",
    category: "async-outcome",
    title: "Job finetune-v3 failed",
    body: "Exited with code 1 after 10m12s · last log line: CUDA out of memory.",
    timestamp: minutesAgo(2),
    read: false,
    href: `/${WORKSPACE_SLUG}/jobs`,
  },
  {
    id: "ntf_apikey_expiring",
    category: "threshold",
    title: "API Key prod-key expires in 24h",
    body: "Rotate before 2026-06-20 15:30 UTC to avoid request failures.",
    timestamp: minutesAgo(42),
    read: false,
    href: `/${WORKSPACE_SLUG}/api-keys`,
  },
  {
    id: "ntf_job_nightly_succeeded",
    category: "async-outcome",
    title: "Job nightly-browse succeeded",
    body: "Completed in 30m42s · 1,842 URLs processed.",
    timestamp: hoursAgo(2),
    read: true,
    href: `/${WORKSPACE_SLUG}/jobs`,
  },
  {
    id: "ntf_sandbox_ttl",
    category: "threshold",
    title: "Sandbox sbx-7f3a9c1e expires in 1h",
    body: "Pin or extend TTL before 16:30 UTC — workspace pool will reclaim it.",
    timestamp: hoursAgo(4),
    read: true,
    href: `/${WORKSPACE_SLUG}/sandboxes`,
  },
  {
    id: "ntf_invite_received",
    category: "collaboration",
    title: "Workspace invitation: astra-staging",
    body: "Hana Park invited you as admin.",
    timestamp: hoursAgo(7),
    read: true,
    href: "/profile",
  },
  {
    id: "ntf_image_build_succeeded",
    category: "async-outcome",
    title: "Image python-3.12@sha:9c1e built",
    body: "Pushed to registry default · 412 MB.",
    timestamp: hoursAgo(11),
    read: true,
    href: `/${WORKSPACE_SLUG}/images`,
  },
  {
    id: "ntf_service_account_rotated",
    category: "security",
    title: "Service account ci-runner rotated",
    body: "Hana Park rotated the key · old key revoked.",
    timestamp: daysAgo(1),
    read: true,
    href: `/${WORKSPACE_SLUG}/api-keys`,
  },
  {
    id: "ntf_credit_balance_low",
    category: "threshold",
    title: "Credit balance below $50",
    body: "Top up to avoid Sandbox throttling at $0.",
    timestamp: daysAgo(1),
    read: true,
    href: "/account/billing/credits",
  },
  {
    id: "ntf_mcp_deploy_failed",
    category: "async-outcome",
    title: "MCP Server search-mcp deploy failed",
    body: "Image manifest missing entrypoint · last successful deploy 3d ago.",
    timestamp: daysAgo(2),
    read: true,
    href: `/${WORKSPACE_SLUG}/mcp-servers`,
  },
  {
    id: "ntf_invite_accepted",
    category: "collaboration",
    title: "Riya Shah accepted your invitation",
    body: "Joined astra-prod as member.",
    timestamp: daysAgo(3),
    read: true,
    href: `/${WORKSPACE_SLUG}/settings/team`,
  },
  {
    id: "ntf_warm_pool_cap",
    category: "threshold",
    title: "Warm pool 18 of 20 sandboxes",
    body: "Nearing concurrent-sandbox cap on Tier 1.",
    timestamp: daysAgo(5),
    read: true,
    href: `/${WORKSPACE_SLUG}/sandboxes`,
  },
];

export function getNotifications(): ReadonlyArray<Notification> {
  return FIXTURES;
}

/**
 * Format an ISO timestamp as a terse relative string against MOCK_NOW.
 * Output buckets: `Xm`, `Xh`, `Xd`. Anything ≥30d falls back to `MMM D`.
 */
export function formatRelativeTime(iso: string): string {
  const diffMs = MOCK_NOW.getTime() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
