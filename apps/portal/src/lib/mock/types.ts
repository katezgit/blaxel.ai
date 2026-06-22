/**
 * Mock data types — shaped to mirror the eventual API contract.
 * Roles collapse to two UI tiers (admin-tier = owner|admin, user-tier = member),
 * but the underlying data model keeps the 3-tier distinction per
 * docs/design/screens/settings.wireframe.md decision log #2.
 */

export type Role = "owner" | "admin" | "member";

export type RoleTier = "admin-tier" | "user-tier";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Org {
  id: string;
  /** URL slug used in routes (`/:workspaceSlugOrId/...`). Stable, lowercase, kebab. */
  slug: string;
  name: string;
  avatarInitial: string;
  /** Short hint shown under the org name in the avatar menu. */
  hint: string;
  /** Total active members in the org (display-only on the Organization page). */
  members: number;
  /** Parent account this workspace belongs to. Display label only. */
  accountName: string;
  /** ISO date string for the workspace's creation timestamp. */
  createdAt: string;
  /** Short opaque workspace identifier surfaced in the dashboard + CLI (e.g. `MPT7PS`). Distinct from `id` (internal) and `slug` (URL). */
  workspaceId: string;
  /** UUID of the parent account. Surfaced read-only for support / billing reference. */
  accountId: string;
  /** Email of the account owner. Surfaced read-only on workspace settings — escalation contact. */
  accountOwner: string;
  /** Display name of the account owner, paired with `accountOwner` email for two-line presentation. */
  accountOwnerName: string;
  /** Workspace-scoped sandbox runtime defaults. */
  sandboxSettings: {
    /** When true, sandboxes do not capture per-process stdout/stderr. Mirrors live Blaxel toggle. */
    disableProcessLogging: boolean;
  };
}

export interface OrgMembership {
  org: Org;
  role: Role;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  isYou?: boolean;
}

/** How a team member was added to the workspace. */
export type MemberSource =
  | "directory-sync"
  | "invitation"
  | "domain-capture"
  | "local";

/** Lifecycle state of a team member or invitation. */
export type MemberStatus = "accepted" | "pending" | "expired";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  source: MemberSource;
  status: MemberStatus;
  isYou?: boolean;
}

/** A non-human identity scoped to the workspace. */
export interface ServiceAccount {
  id: string;
  name: string;
  /** Public identifier the workspace shows to integrations. */
  clientId: string;
  role: Role;
  /** ISO date string. */
  createdAt: string;
}

/** Categories shown in the Integrations left rail. */
export type IntegrationCategory = "model" | "mcp-server";

export interface Integration {
  id: string;
  /** Human-readable provider name. */
  name: string;
  description: string;
  category: IntegrationCategory;
  /** Single-letter monogram for the card avatar fallback. */
  logoInitial: string;
  /** Brand logo URL (simple-icons CDN). Falls back to `logoInitial` when absent. */
  logoUrl?: string;
  enabled: boolean;
  comingSoon?: boolean;
  /** Service accounts currently holding credentials for this integration. */
  usedByCount?: number;
  /** ISO date string — last time this integration was exercised by a service account. */
  lastActivityAt?: string;
  /** Active provider-side issue surfaced as an inline warning band under the row (e.g. "401 from /v1/models — rotate the workspace key"). */
  statusWarning?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  /** Masked display value, e.g. "sk-hud-…-w6". */
  masked: string;
  createdAt: string;
  expiresAt: string | null;
  /** Who the key was issued to — member or service account. */
  issuedTo?: ApiKeyHolder;
}

/** Identifies the entity an API key is bound to. */
export interface ApiKeyHolder {
  kind: "member" | "service-account";
  id: string;
  name: string;
}

export type BillingHistoryStatus = "completed" | "pending" | "failed";

export interface BillingHistoryEntry {
  id: string;
  /** ISO-ish date string ("YYYY-MM-DD") — same shape as ApiKey.createdAt. */
  date: string;
  /** Human label, e.g. "Credit purchase", "Monthly invoice", "User signup". */
  type: string;
  status: BillingHistoryStatus;
  /** Positive number for credit grants/purchases; null for non-credit rows. */
  credits: number | null;
  /** USD amount; 0 for free credits. */
  amount: number;
}

export interface Secret {
  id: string;
  name: string;
  scope: string;
  /** Plaintext secret value — hidden by default in the table, revealable per-row. */
  value: string;
}

export interface UsageRow {
  resource: string;
  used: string;
  credits: number;
}

export interface LimitRow {
  name: string;
  current: number;
  max: number;
  unit?: string;
}

export interface CreditState {
  balance: number;
  total: number;
  burnRatePerHour: number;
  runwayHours: number;
}

export interface OrgAddress {
  /** Primary business address — line 1 (street). */
  line1: string;
  /** Optional secondary line (suite, floor, etc.). Empty string when unused. */
  line2: string;
  country: string;
  /** State / province / region — free-form to cover non-US orgs. */
  state: string;
  city: string;
  postalCode: string;
}
