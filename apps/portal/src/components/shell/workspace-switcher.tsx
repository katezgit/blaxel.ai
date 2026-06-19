"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, ChevronDown, Plus, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { cn } from "@repo/ui/lib/cn";
import { useIsSidebarRail } from "@/components/shell/use-is-sidebar-rail";
import type { Org } from "@/lib/mock/types";

interface WorkspaceSwitcherProps {
  currentOrg: Org;
  workspaces: ReadonlyArray<Org>;
}

export function WorkspaceSwitcher({
  currentOrg,
  workspaces,
}: WorkspaceSwitcherProps) {
  const pathname = usePathname();
  const isRail = useIsSidebarRail();
  const inSettings = pathname.startsWith(`/${currentOrg.slug}/settings`);
  const settingsHref = `/${currentOrg.slug}/settings/general`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={isRail ? `Switch workspace (current: ${currentOrg.name})` : undefined}
        className={cn(
          "flex min-w-0 max-w-full items-center rounded-md border text-label font-medium text-foreground",
          "hover:bg-secondary-surface focus-visible:shadow-focus-ring",
          isRail
            ? "border-transparent p-1"
            : "gap-1.5 border-border px-2 py-1 max-md:gap-1 max-md:px-1.5 max-md:py-0.5",
        )}
      >
        <Boxes aria-hidden="true" className="size-4 shrink-0 text-meta-foreground" />
        {!isRail && (
          <>
            <span className="min-w-0 flex-1 truncate max-md:text-sm">
              {currentOrg.name}
            </span>
            <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-meta-foreground" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
        {workspaces.map((ws) => (
          <DropdownMenuItem key={ws.id} asChild>
            <Link href={`/${ws.slug}/sandboxes`} className="gap-2">
              <Avatar size="xs" shape="square">
                <AvatarFallback>{ws.avatarInitial}</AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate">{ws.name}</span>
              {ws.id === currentOrg.id ? (
                <span className="font-mono text-meta text-meta-foreground">current</span>
              ) : null}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            /* TODO: create-workspace flow */
          }}
        >
          <Plus aria-hidden="true" />
          <span>Create workspace</span>
        </DropdownMenuItem>
        <DropdownMenuItem asChild aria-current={inSettings ? "page" : undefined}>
          <Link href={settingsHref}>
            <Settings aria-hidden="true" />
            <span className="flex-1">Workspace settings</span>
            <span aria-hidden="true" className="text-meta-foreground">
              {inSettings ? "·" : "→"}
            </span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
