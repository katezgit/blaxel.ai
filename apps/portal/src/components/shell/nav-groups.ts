/**
 * Each nav item carries the lucide-react component to render both inline next
 * to the label and (centered) in the tablet icon rail. Only one sidebar
 * variant renders at a time so they never visually collide.
 */
import {
  ArrowLeft,
  Bot,
  BrainCircuit,
  Building2,
  Container,
  CreditCard,
  Database,
  FolderOpen,
  Gauge,
  Gem,
  Globe,
  KeyRound,
  LayoutGrid,
  Lock,
  Mail,
  Network,
  Package,
  Plug,
  ShieldCheck,
  SlidersHorizontal,
  User,
  UserCog,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

// Re-exported so the sub-shell return header can stay on the same lucide
// import surface as the nav items themselves.
export { ArrowLeft };

export interface NavItem {
  href: string;
  label: string;
  /** lucide-react component, rendered inline (16×16) and in the icon rail (20×20). */
  icon: LucideIcon;
  /**
   * When true, the item is active only on an exact pathname match. Default
   * (prefix match) lights the item up on every nested route — wrong for
   * container/index routes whose siblings also live in the same nav (e.g.
   * `/profile` vs `/profile/security`).
   */
  exact?: boolean;
}

export interface NavGroup {
  label: string;
  items: ReadonlyArray<NavItem>;
}

/** Workspace-shell sidebar — three groups per wireframe §13. */
export function workspaceNavGroups(
  workspaceSlug: string,
): ReadonlyArray<NavGroup> {
  const base = `/${workspaceSlug}`;
  return [
    {
      label: "Sandboxes",
      items: [
        { href: `${base}/sandboxes`, label: "Sandboxes", icon: Container },
        { href: `${base}/volumes`, label: "Volumes", icon: Database },
        { href: `${base}/agent-drive`, label: "Agent Drive", icon: FolderOpen },
        { href: `${base}/images`, label: "Images", icon: Package },
      ],
    },
    {
      label: "Hosting",
      items: [
        { href: `${base}/agents`, label: "Agents", icon: Bot },
        { href: `${base}/jobs`, label: "Jobs", icon: Workflow },
        { href: `${base}/mcp-servers`, label: "MCP Servers", icon: Plug },
        { href: `${base}/model-apis`, label: "Model APIs", icon: BrainCircuit },
        { href: `${base}/network`, label: "Network", icon: Network },
        {
          href: `${base}/custom-domains`,
          label: "Custom Domains",
          icon: Globe,
        },
      ],
    },
    {
      label: "Security",
      items: [
        {
          href: `${base}/settings/api-keys`,
          label: "API keys",
          icon: KeyRound,
        },
        { href: `${base}/policies`, label: "Policies", icon: ShieldCheck },
      ],
    },
  ];
}

/**
 * Workspace-settings sub-sidebar. API keys lives in this group because every
 * workspace-scoped credential acts on workspace resources — see the tenancy
 * decision rule in `docs/product/platform.md`.
 */
export function workspaceSettingsNavItems(
  workspaceSlug: string,
): ReadonlyArray<NavItem> {
  const base = `/${workspaceSlug}/settings`;
  return [
    { href: `${base}/name`, label: "Name", icon: Building2 },
    { href: `${base}/team`, label: "Team", icon: Users },
    {
      href: `${base}/service-accounts`,
      label: "Service accounts",
      icon: UserCog,
    },
    { href: `${base}/integrations`, label: "Integrations", icon: Plug },
    { href: `${base}/api-keys`, label: "API keys", icon: KeyRound },
  ];
}

/**
 * Profile sub-shell — user-scoped identity, security, preferences. Profile
 * belongs to one person; the sidebar carries only personal items so the
 * surface reads as "your stuff" not "stuff this account holds."
 */
export const PERSONAL_NAV_GROUPS: ReadonlyArray<NavGroup> = [
  {
    label: "Personal",
    items: [
      { href: "/profile", label: "Profile", icon: User, exact: true },
      { href: "/profile/security", label: "Security", icon: ShieldCheck },
      { href: "/profile/preferences", label: "Preferences", icon: SlidersHorizontal },
      { href: "/profile/invitations", label: "Invitations", icon: Mail },
    ],
  },
];

/**
 * Account sub-shell — the account is a multi-admin business entity, not a
 * personal surface. Account holds identity + admins + workspaces + login
 * policy; Billing holds plan/credits/add-ons.
 */
export const ACCOUNT_NAV_GROUPS: ReadonlyArray<NavGroup> = [
  {
    label: "Account",
    items: [
      { href: "/account", label: "Overview", icon: Building2, exact: true },
      { href: "/account/admins", label: "Admins", icon: Users },
      { href: "/account/workspaces", label: "Workspaces", icon: LayoutGrid },
      { href: "/account/login-policy", label: "Login policy", icon: Lock },
    ],
  },
  {
    label: "Billing",
    items: [
      { href: "/account/billing/plan", label: "Plan & quotas", icon: Gauge },
      { href: "/account/billing/credits", label: "Billing & credits", icon: CreditCard },
      { href: "/account/billing/add-ons", label: "Add-ons", icon: Gem },
    ],
  },
];
