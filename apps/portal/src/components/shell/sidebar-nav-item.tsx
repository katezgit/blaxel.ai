"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@repo/ui/components/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import { useIsSidebarRail } from "@/components/shell/use-is-sidebar-rail";
import type { NavItem } from "@/components/shell/nav-groups";

interface SidebarNavItemProps {
  item: NavItem;
  onNavigate?: () => void;
}

export default function SidebarNavItem({ item, onNavigate }: SidebarNavItemProps) {
  const pathname = usePathname();
  const isRail = useIsSidebarRail();
  const isActive = item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      data-nav-item
      aria-current={isActive ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "group sidebar-row-hover flex h-8 items-center gap-2 rounded-md px-2 text-label outline-hidden",
        "focus-visible:shadow-focus-ring",
        isActive
          ? "bg-primary-glow text-primary"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon
        aria-hidden="true"
        data-nav-icon
        className="size-4 shrink-0"
      />
      <span data-nav-label className="truncate">
        {item.label}
      </span>
      {item.badge ? (
        <span data-nav-label className="ml-auto">
          <Badge variant="brand-soft" size="sm" className="font-sans">
            {item.badge}
          </Badge>
        </span>
      ) : null}
    </Link>
  );

  if (!isRail) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}
