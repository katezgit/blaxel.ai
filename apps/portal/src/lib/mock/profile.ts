/**
 * Personal-area mock fixtures — backing `/profile/...` pages.
 * Shaped to mirror an eventual REST contract so the page code matches
 * what the real API will return.
 */

export interface ProfileIdentity {
  givenName: string;
  familyName: string;
  email: string;
  /** Whether email is locked because it came from an OAuth provider. */
  emailFromOAuth: boolean;
}

export type OAuthProvider = "google" | "github" | "microsoft";

export interface OAuthConnection {
  id: string;
  provider: OAuthProvider;
  /** Display name shown in the table cell. */
  label: string;
  /** ISO date the connection was created. */
  createdAt: string;
  /** True if this is the provider used at last sign-in. */
  lastUsed: boolean;
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  /** ISO timestamp of last activity. */
  lastActiveAt: string;
  /** Marks the session that issued the current page request. */
  isCurrent: boolean;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceName: string;
  invitedBy: string;
  invitedAt: string;
  role: "owner" | "admin" | "member";
}

export const profileIdentity: ProfileIdentity = {
  givenName: "Avery",
  familyName: "Lin",
  email: "avery@acme.dev",
  emailFromOAuth: true,
};

export const oauthConnections: ReadonlyArray<OAuthConnection> = [
  {
    id: "oa_google",
    provider: "google",
    label: "Google",
    createdAt: "2026-04-02",
    lastUsed: true,
  },
];

export const activeSessions: ReadonlyArray<ActiveSession> = [
  {
    id: "s_current",
    device: "MacBook Pro",
    browser: "Chrome 142 on macOS",
    location: "San Francisco, US",
    lastActiveAt: "2026-06-19T14:22:00Z",
    isCurrent: true,
  },
  {
    id: "s_iphone",
    device: "iPhone 15",
    browser: "Safari 18 on iOS",
    location: "San Francisco, US",
    lastActiveAt: "2026-06-18T22:10:00Z",
    isCurrent: false,
  },
  {
    id: "s_linux",
    device: "Linux workstation",
    browser: "Firefox 128 on Linux",
    location: "Berlin, DE",
    lastActiveAt: "2026-06-14T09:45:00Z",
    isCurrent: false,
  },
];

export interface WorkspaceMembership {
  id: string;
  workspaceName: string;
  workspaceSlug: string;
  role: "owner" | "admin" | "member";
  /** ISO timestamp of when this user joined the workspace. */
  joinedAt: string;
  /** ISO timestamp of last activity in this workspace. */
  lastAccessedAt: string;
}

export const workspaceMemberships: ReadonlyArray<WorkspaceMembership> = [
  {
    id: "wsm_astra_prod",
    workspaceName: "astra-prod",
    workspaceSlug: "astra-prod",
    role: "admin",
    joinedAt: "2026-04-12",
    lastAccessedAt: "2026-06-21T09:14:00Z",
  },
  {
    id: "wsm_astra_eval",
    workspaceName: "astra-eval",
    workspaceSlug: "astra-eval",
    role: "admin",
    joinedAt: "2026-05-19",
    lastAccessedAt: "2026-06-20T16:30:00Z",
  },
  {
    id: "wsm_astra_staging",
    workspaceName: "astra-staging",
    workspaceSlug: "astra-staging",
    role: "member",
    joinedAt: "2026-03-02",
    lastAccessedAt: "2026-05-28T11:05:00Z",
  },
];

export const workspaceInvitations: ReadonlyArray<WorkspaceInvitation> = [
  {
    id: "inv_horizon",
    workspaceName: "horizon-labs",
    invitedBy: "kai@horizon.dev",
    invitedAt: "2026-06-18T11:00:00Z",
    role: "admin",
  },
  {
    id: "inv_blueprint",
    workspaceName: "blueprint-ai",
    invitedBy: "mira@blueprint.ai",
    invitedAt: "2026-06-15T15:30:00Z",
    role: "member",
  },
];
