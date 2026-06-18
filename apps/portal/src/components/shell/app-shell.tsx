"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Bot,
  Box,
  BrainCircuit,
  ChevronDown,
  Code2,
  Database,
  FileCheck2,
  Globe,
  HardDrive,
  Home,
  Info,
  Key,
  LayoutGrid,
  ListTree,
  Menu,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import { IconButton } from "@repo/ui/components/icon-button";
import {
  TooltipProvider,
} from "@repo/ui/components/tooltip";
import { useSuspenseQuery } from "@tanstack/react-query";
import { cn } from "@repo/ui/lib/cn";
import { RoleProvider } from "@/lib/mock/role-context";
import type { Org } from "@/lib/mock/types";
import { orgQueries } from "@/lib/query/org";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { AvatarMenu, AvatarMenuCollapsed } from "@/components/shell/avatar-menu";
import { BrandMark } from "@/components/shell/brand-mark";
import { SidebarProvider } from "@/components/shell/sidebar-context";
import { SidebarNavLink } from "@/components/shell/sidebar-nav-link";
import { SkipToContent } from "@/components/shell/skip-to-content";
import { useSidebarShortcut } from "@/components/shell/use-sidebar-shortcut";
import { useSidebarState } from "@/components/shell/use-sidebar-state";

interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
  count?: number;
  badge?: string;
}

interface NavSection {
  label: string;
  items: ReadonlyArray<NavItem>;
}

const TOP_ITEMS: ReadonlyArray<NavItem> = [
  { href: "/", label: "Dashboard", Icon: Home },
];

const SECTIONS: ReadonlyArray<NavSection> = [
  {
    label: "Sandboxes",
    items: [
      { href: "/sandboxes", label: "Sandboxes", Icon: Box, count: 0 },
      { href: "/volumes", label: "Volumes", Icon: Database, count: 0 },
      { href: "/agent-drive", label: "Agent Drive", Icon: HardDrive, badge: "Preview" },
      { href: "/images", label: "Images", Icon: LayoutGrid, count: 0 },
    ],
  },
  {
    label: "Hosting",
    items: [
      { href: "/agents", label: "Agents", Icon: Bot, badge: "SOON" },
      { href: "/jobs", label: "Jobs", Icon: ListTree, count: 0 },
      { href: "/mcp-servers", label: "MCP servers", Icon: Code2, count: 0 },
      { href: "/models", label: "Model APIs", Icon: BrainCircuit, count: 1 },
    ],
  },
  {
    label: "Network",
    items: [
      { href: "/custom-domains", label: "Custom domains", Icon: Globe, count: 0 },
    ],
  },
  {
    label: "Security",
    items: [
      { href: "/api-keys", label: "API keys", Icon: Key },
      { href: "/policies", label: "Policies", Icon: FileCheck2, count: 0 },
    ],
  },
];

const BOTTOM_ITEMS: ReadonlyArray<NavItem> = [
  { href: "/manage", label: "Settings", Icon: Settings },
  { href: "/information", label: "Information", Icon: Info },
];

const ALL_FLAT_ITEMS: ReadonlyArray<NavItem> = [
  ...TOP_ITEMS,
  ...SECTIONS.flatMap((s) => s.items),
  ...BOTTOM_ITEMS,
];

const MOBILE_DRAWER_ID = "shell-mobile-drawer";

interface AppShellProps {
  email: string;
  name: string;
  children: ReactNode;
}

export default function AppShell({ email, name, children }: AppShellProps) {
  const { collapsed, toggle } = useSidebarState();
  useSidebarShortcut(toggle);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const user = { name: name || "User", email };
  const { accountId } = useCurrentTenancy();
  // Suspense-mode query: layout prefetched this exact key, so hydration
  // resolves synchronously on first paint and no fallback ever shows.
  const { data: currentOrg } = useSuspenseQuery(orgQueries.account(accountId));

  return (
    <RoleProvider>
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden text-foreground">
          <SkipToContent />

          <aside
            aria-label="Workspace navigation rail"
            className="hidden w-[52px] shrink-0 flex-col border-r border-border md:flex lg:hidden"
          >
            <SidebarProvider collapsed={true} toggle={toggle}>
              <SidebarBody collapsed={true} user={user} currentOrg={currentOrg} />
            </SidebarProvider>
          </aside>

          <aside
            style={{ viewTransitionName: "shell-sidebar" }}
            className={cn(
              "hidden shrink-0 flex-col border-r border-border transition-[width] duration-subtle ease-out-standard lg:flex",
              collapsed ? "lg:w-[52px]" : "lg:w-[248px]",
            )}
          >
            <SidebarProvider collapsed={collapsed} toggle={toggle}>
              <SidebarBody collapsed={collapsed} user={user} currentOrg={currentOrg} />
            </SidebarProvider>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <MobileTopBar
              drawerOpen={drawerOpen}
              onOpenDrawer={() => setDrawerOpen(true)}
              user={user}
              currentOrg={currentOrg}
            />

            <main
              id="main-content"
              className="flex-1 overflow-y-auto bg-grid-backdrop bg-panel"
            >
              {children}
            </main>
          </div>

          <Drawer
            direction="left"
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
          >
            <DrawerContent
              id={MOBILE_DRAWER_ID}
              size="sm"
              className="data-[vaul-drawer-direction=left]:w-[280px] bg-muted-surface"
              aria-label="Main navigation"
            >
              <DrawerTitle className="sr-only">Main navigation</DrawerTitle>
              <div
                onClickCapture={(event) => {
                  const target = event.target as HTMLElement;
                  if (target.closest("a[href]")) setDrawerOpen(false);
                }}
                className="flex h-full flex-col"
              >
                <SidebarProvider collapsed={false} toggle={toggle}>
                  <SidebarBody
                    collapsed={false}
                    user={user}
                    currentOrg={currentOrg}
                    headerTrailing={
                      <DrawerClose asChild>
                        <IconButton
                          variant="ghost"
                          size="md"
                          aria-label="Close navigation"
                        >
                          <X />
                        </IconButton>
                      </DrawerClose>
                    }
                  />
                </SidebarProvider>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </TooltipProvider>
    </RoleProvider>
  );
}

interface SidebarBodyProps {
  collapsed: boolean;
  user: { name: string; email: string };
  currentOrg: Org;
  headerTrailing?: ReactNode;
}

function SidebarBody({ collapsed, user, currentOrg, headerTrailing }: SidebarBodyProps) {
  return (
    <>
      {headerTrailing ? (
        <div className="flex items-center justify-between pr-3">
          <BrandMark collapsed={collapsed} />
          {headerTrailing}
        </div>
      ) : (
        <BrandMark collapsed={collapsed} />
      )}

      <nav
        aria-label="Main navigation"
        className="flex flex-1 flex-col min-w-0 overflow-y-auto overflow-x-hidden pb-1"
      >
        {collapsed ? (
          <FlatItems items={ALL_FLAT_ITEMS} />
        ) : (
          <>
            <NavList items={TOP_ITEMS} />
            {SECTIONS.map((section) => (
              <Section key={section.label} section={section} />
            ))}
            <div className="mt-2">
              <NavList items={BOTTOM_ITEMS} />
            </div>
          </>
        )}
      </nav>

      {collapsed ? (
        <div className="mx-1.5 mb-3 mt-1 border-t border-border pt-2">
          <AvatarMenuCollapsed user={user} currentOrg={currentOrg} />
        </div>
      ) : (
        <div className="border-t border-border px-2 pt-2 pb-2">
          <AvatarMenu user={user} currentOrg={currentOrg} />
        </div>
      )}
    </>
  );
}

function Section({ section }: { section: NavSection }) {
  const [open, setOpen] = useState(true);
  const sectionId = useMemo(
    () => `nav-section-${section.label.toLowerCase().replace(/\s+/g, "-")}`,
    [section.label],
  );

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={sectionId}
        className="flex items-center justify-between px-4 pt-3 pb-0.5 text-left font-mono font-medium text-meta text-meta-foreground uppercase hover:text-foreground"
      >
        <span>{section.label}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-3 transition-transform duration-subtle",
            open ? "" : "-rotate-90",
          )}
        />
      </button>
      {open && (
        <div id={sectionId}>
          <NavList items={section.items} />
        </div>
      )}
    </div>
  );
}

function NavList({ items }: { items: ReadonlyArray<NavItem> }) {
  return (
    <ul className="flex flex-col gap-1 mt-0.5 px-2">
      {items.map((item) => (
        <li key={item.href}>
          <SidebarNavLink
            href={item.href}
            label={item.label}
            icon={<item.Icon className="size-4 shrink-0" />}
            count={item.count}
            badge={item.badge}
          />
        </li>
      ))}
    </ul>
  );
}

function FlatItems({ items }: { items: ReadonlyArray<NavItem> }) {
  return (
    <ul className="flex flex-col gap-1 px-1.5 pt-1">
      {items.map((item) => (
        <li key={item.href}>
          <SidebarNavLink
            href={item.href}
            label={item.label}
            icon={<item.Icon className="size-4 shrink-0" />}
          />
        </li>
      ))}
    </ul>
  );
}

interface MobileTopBarProps {
  drawerOpen: boolean;
  onOpenDrawer: () => void;
  user: { name: string; email: string };
  currentOrg: Org;
}

function MobileTopBar({ drawerOpen, onOpenDrawer, user, currentOrg }: MobileTopBarProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-muted-surface px-3 md:hidden">
      <div className="flex items-center gap-1">
        <IconButton
          variant="ghost"
          size="md"
          aria-label="Open navigation"
          aria-expanded={drawerOpen}
          aria-controls={MOBILE_DRAWER_ID}
          onClick={onOpenDrawer}
        >
          <Menu />
        </IconButton>
        <BrandMark />
      </div>
      <div className="flex items-center gap-1">
        <AvatarMenuCollapsed user={user} currentOrg={currentOrg} />
      </div>
    </header>
  );
}
