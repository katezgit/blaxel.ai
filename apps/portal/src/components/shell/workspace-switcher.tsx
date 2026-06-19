"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Plus, Settings } from "lucide-react";
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

export default function WorkspaceSwitcher({
  currentOrg,
  workspaces,
}: WorkspaceSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isRail = useIsSidebarRail();
  const inSettings = pathname.startsWith(`/${currentOrg.slug}/settings`);
  const settingsHref = `/${currentOrg.slug}/settings/name`;
  const triggerAriaLabel = `Switch workspace (current: ${currentOrg.name} · ${currentOrg.accountName})`;

  // Path tail after the workspace-slug segment — preserved verbatim on switch
  // so the user lands on the same surface in the new workspace (operator
  // requirement: comparing membership / sandboxes across workspaces shouldn't
  // dump you back at /sandboxes every time).
  const pathRest = pathname.replace(/^\/[^/]+/, "") || "/sandboxes";
  const queryString = searchParams.toString();
  const querySuffix = queryString ? `?${queryString}` : "";
  // Hash isn't exposed by next/navigation — read from window post-mount.
  // Setter wired to hashchange so deep-linked anchors survive workspace switch.
  const [hash, setHash] = useState("");
  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={triggerAriaLabel}
        className={cn(
          "flex min-w-0 max-w-full items-center rounded-md border text-label font-medium text-foreground",
          "hover:bg-secondary-surface focus-visible:shadow-focus-ring",
          isRail
            ? "border-transparent p-1"
            : "gap-2 border-border px-2 py-1 max-md:gap-1.5 max-md:px-1.5 max-md:py-0.5",
        )}
      >
        <Avatar size="xs" shape="square" aria-hidden="true">
          <AvatarFallback>{currentOrg.avatarInitial}</AvatarFallback>
        </Avatar>
        {!isRail && (
          <>
            <span className="flex min-w-0 flex-1 flex-col items-start leading-tight">
              <span className="min-w-0 truncate max-md:text-sm">
                {currentOrg.name}
              </span>
              <span className="hidden min-w-0 truncate text-meta font-normal text-meta-foreground md:block">
                {currentOrg.accountName} account
              </span>
            </span>
            <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-meta-foreground" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
        {workspaces.map((ws) => {
          const isCurrent = ws.id === currentOrg.id;
          return (
            <DropdownMenuItem key={ws.id} asChild>
              <Link
                href={`/${ws.slug}${pathRest}${querySuffix}${hash}`}
                className="gap-2"
                aria-current={isCurrent ? "true" : undefined}
              >
                <Avatar size="xs" shape="square">
                  <AvatarFallback>{ws.avatarInitial}</AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate">{ws.name}</span>
                {isCurrent ? (
                  <span className="font-mono text-meta text-meta-foreground">
                    current
                  </span>
                ) : null}
              </Link>
            </DropdownMenuItem>
          );
        })}
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
