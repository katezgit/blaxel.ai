/**
 * Wireframe contract: docs/design/wireframe/app-shell.md §13.
 * Each nav item carries the lucide-react component to render both inline
 * next to the label and (centered) in the tablet icon rail. Hard rule §3.9 —
 * one sidebar at a time — keeps the variants from colliding visually.
 */
import {
  AlertOctagon,
  ArrowLeft,
  Bot,
  BrainCircuit,
  Container,
  CreditCard,
  Database,
  FolderOpen,
  Gauge,
  Globe,
  KeyRound,
  Mail,
  Network,
  Package,
  Plug,
  Receipt,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  User,
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
        { href: `${base}/api-keys`, label: "API Keys", icon: KeyRound },
        { href: `${base}/policies`, label: "Policies", icon: ShieldCheck },
      ],
    },
  ];
}

/** Workspace-settings sub-sidebar — wireframe §13 (sub-shell table). */
export function workspaceSettingsNavItems(
  workspaceSlug: string,
): ReadonlyArray<NavItem> {
  const base = `/${workspaceSlug}/settings`;
  return [
    { href: `${base}/general`, label: "General", icon: Settings },
    { href: `${base}/team`, label: "Team", icon: Users },
    {
      href: `${base}/sandbox-settings`,
      label: "Sandbox settings",
      icon: SlidersHorizontal,
    },
    {
      href: `${base}/usage-and-limits`,
      label: "Usage & limits",
      icon: Gauge,
    },
    { href: `${base}/danger-zone`, label: "Danger zone", icon: AlertOctagon },
  ];
}

/**
 * Personal-area sub-sidebar — user-scoped identity, security, preferences.
 * "Account" is a billing-bearing business entity (multi-admin); this menu is
 * personal-only. Routes live under `/profile/...` to reflect that distinction.
 */
export const PROFILE_NAV_GROUPS: ReadonlyArray<NavGroup> = [
  {
    label: "Personal",
    items: [
      { href: "/profile", label: "Profile", icon: User, exact: true },
      { href: "/profile/security", label: "Security", icon: ShieldCheck },
      { href: "/profile/preferences", label: "Preferences", icon: SlidersHorizontal },
      { href: "/profile/invitations", label: "Invitations", icon: Mail },
    ],
  },
  {
    label: "Billing",
    items: [
      { href: "/profile/billing", label: "Billing", icon: CreditCard },
      { href: "/profile/invoices", label: "Invoices", icon: Receipt },
    ],
  },
];
