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
  FolderOpen,
  Gauge,
  HardDrive,
  KeyRound,
  Link2,
  Network,
  Package,
  Plug,
  Receipt,
  Settings,
  Settings2,
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
        { href: `${base}/volumes`, label: "Volumes", icon: HardDrive },
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
          icon: Link2,
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

/** Account sub-sidebar — wireframe §13 (sub-shell table). */
export const ACCOUNT_NAV_ITEMS: ReadonlyArray<NavItem> = [
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/preferences", label: "Preferences", icon: Settings2 },
  { href: "/account/billing", label: "Billing", icon: CreditCard },
  { href: "/account/invoices", label: "Invoices", icon: Receipt },
];
