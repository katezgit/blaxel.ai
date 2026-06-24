"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import { useIsSidebarRail } from "@/components/shell/use-is-sidebar-rail";
import type { Org } from "@/lib/mock/types";

const LABEL = "Back";

interface SubShellSidebarReturnHeaderProps {
  workspace: Org;
  onNavigate?: () => void;
}

export function SubShellSidebarReturnHeader({
  workspace,
  onNavigate,
}: SubShellSidebarReturnHeaderProps) {
  const isRail = useIsSidebarRail();
  const link = (
    <Link
      href={`/${workspace.slug}/sandboxes`}
      data-sub-shell-return
      onClick={onNavigate}
      className={cn(
        // Geometry copy of SidebarNavItem: h-8, rounded-md, sits inside the
        // parent <nav>'s px-2 gutter so the hover background is a rounded
        // pill, not a full-width band. Wrapper below adds pt-1 so the row's
        // vertical center stays at y≈20 — see comment in sidebar.tsx where
        // the collapse chevron's top-5 is pinned to that centerline.
        "group sidebar-row-hover flex h-8 items-center gap-2 rounded-md",
        isRail ? "justify-center px-0" : "px-2",
        "typography-body text-muted-foreground outline-hidden",
        "hover:text-foreground",
        "focus-visible:shadow-focus-ring",
      )}
    >
      <ArrowLeft
        aria-hidden="true"
        data-sub-shell-return-icon
        className="size-4 shrink-0"
      />
      <span
        data-sub-shell-return-label
        className={cn("truncate", isRail && "sr-only")}
      >
        {LABEL}
      </span>
    </Link>
  );

  return (
    <div className="pt-1 pb-2 border-b border-sidebar-border">
      {isRail ? (
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right">{LABEL}</TooltipContent>
        </Tooltip>
      ) : (
        link
      )}
    </div>
  );
}
