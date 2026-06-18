"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import { useSidebar } from "@/components/shell/sidebar-context";

interface SidebarNavLinkProps {
  href: string;
  label: string;
  icon: ReactNode;
  count?: number;
  badge?: string;
}

export function SidebarNavLink({ href, label, icon, count, badge }: SidebarNavLinkProps) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const isActive =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  const link = (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative flex h-8 w-full items-center gap-2.5 rounded-md text-body",
        collapsed ? "justify-center px-0" : "px-2",
        isActive
          ? "bg-primary-glow text-primary font-medium"
          : "text-muted-foreground sidebar-row-hover group-hover:text-foreground",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex shrink-0",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
        )}
      >
        {icon}
      </span>
      <span className={cn("truncate", collapsed && "sr-only")}>{label}</span>
      {!collapsed && badge && (
        <span className="ml-auto rounded-full bg-primary-glow px-1.5 py-0.5 font-mono text-meta uppercase text-primary">
          {badge}
        </span>
      )}
      {!collapsed && badge === undefined && typeof count === "number" && (
        <span className="ml-auto font-mono text-meta text-meta-foreground tabular-nums">
          {count}
        </span>
      )}
    </Link>
  );

  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
