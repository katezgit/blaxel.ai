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

/** A non-human identity scoped to the workspace.
 *
 * Permissions are not modelled here. SA permissions are assigned via the
 * workspace team-members endpoint (`PUT /users/{subOrEmail}`) — the same path
 * human members use — so the role lives with the membership, not with the SA.
 * `PUT /service_accounts/{id}` accepts only `name` + `description`. */
export interface ServiceAccount {
  id: string;
  name: string;
  /** Required human-readable purpose surfaced in the list subline and detail header. */
  description: string;
  /** Public identifier the workspace shows to integrations. */
  clientId: string;
  /** ISO timestamp (full createdAt — `MMM D, YYYY · HH:mm UTC` on detail page). */
  createdAt: string;
  /** API keys issued from this service account. */
  apiKeys: ReadonlyArray<ServiceAccountApiKey>;
  /**
   * ISO timestamp of the most recent request authenticated with any of this
   * SA's credentials, or null when never used. Forward backend ask #1 —
   * surfaces as "Last used" column on the list page.
   */
  lastUsedAt: string | null;
}

/**
 * API key issued from a service account. Distinct from workspace `ApiKey`
 * (which can be issued to a member OR a service account from the API keys
 * surface). SA-scoped keys carry no holder — they belong to their parent SA.
 */
export interface ServiceAccountApiKey {
  id: string;
  /** Parent service account id. */
  serviceAccountId: string;
  name: string;
  /** First N chars of the full key; full key is shown once at creation only. */
  keyPrefix: string;
  /** ISO date — null = no expiration. */
  expiresAt: string | null;
  /** ISO timestamp at creation. */
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
  comingSoon?: boolean;
}

/**
 * A single workspace-scoped credential for an integration provider. Mirrors
 * the eventual `integrations.blaxel.ai/v1/{provider}/connections/{name}`
 * shape — `id` is the user-chosen `metadata.name`, surfaced verbatim in URLs
 * and CLI commands. Enabled-state for a provider is derived from connection
 * count > 0, not stored on the parent.
 */
export interface IntegrationConnection {
  /** `metadata.name` — user-chosen, immutable after creation. */
  id: string;
  /** Parent provider id (e.g. "anthropic", "openai"). */
  providerId: string;
  /** Masked tail of the stored API key, e.g. "sk-••••••wAA". */
  apiKeyPreview: string;
  /** ISO date string — when the connection was created. */
  createdAt: string;
  /** Optional display name of the creator (member or service account). */
  createdBy?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  /** Masked display value, e.g. "sk-hud-…-w6". */
  masked: string;
  createdAt: string;
  expiresAt: string | null;
  /** ISO timestamp of the most recent request authenticated with this key.
   *  Null = never used since issuance — primary hygiene signal for revocation. */
  lastUsedAt: string | null;
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
