"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@repo/ui/lib/cn";

interface SandboxDetailTabsProps {
  workspaceSlug: string;
  sandboxName: string;
}

interface TabSpec {
  label: string;
  segment: "" | "settings" | "schedules" | "logs" | "terminal";
}

const TABS: ReadonlyArray<TabSpec> = [
  { label: "Overview", segment: "" },
  { label: "Settings", segment: "settings" },
  { label: "Schedules", segment: "schedules" },
  { label: "Logs", segment: "logs" },
  { label: "Terminal", segment: "terminal" },
];

/** URL-routed tab strip for the sandbox detail surface. Active tab derived
 * from `usePathname` — `<Link>` per tab, no client-side state. Only the
 * active tab carries a visible bottom border (orange `border-primary`); the
 * inactive tabs are flat, no continuous hairline drawn through the strip —
 * the active indicator IS the signal. No sliding indicator — the URL
 * change is the primary state signal; the indicator slide is decorative
 * motion better suited to single-page tabs. */
export default function SandboxDetailTabs({
  workspaceSlug,
  sandboxName,
}: SandboxDetailTabsProps) {
  const pathname = usePathname();
  const basePath = `/${workspaceSlug}/sandboxes/${sandboxName}`;
  return (
    <nav aria-label="Sandbox sections" className="flex w-full">
      <ul className="flex w-fit">
        {TABS.map((tab) => {
          const href = tab.segment === "" ? basePath : `${basePath}/${tab.segment}`;
          const isActive =
            tab.segment === "" ? pathname === basePath : pathname === href;
          return (
            <li key={tab.segment}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative inline-flex items-center whitespace-nowrap px-1.5 py-2 typography-body font-medium",
                  "border-b-2",
                  "transition-colors duration-fast ease-out-standard",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-meta-foreground hover:text-foreground hover:border-border-strong",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
