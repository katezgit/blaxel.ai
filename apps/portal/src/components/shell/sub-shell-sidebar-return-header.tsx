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

const LABEL = "Return to app";

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
        // Negative -mx-2 cancels the parent <nav>'s px-2 so the bottom border
        // spans the full sidebar width. pr-4 restores the 16px right inset;
        // pl-3.5 (14px) optically aligns the ArrowLeft glyph's leftmost visible
        // pixel with the nav-item icon column — Lucide's ArrowLeft has ~2px of
        // internal left-bearing more than the nav icons inside its 24-unit
        // viewBox, so the SVG box needs to shift 2px left to match.
        "sidebar-row-hover group flex items-center gap-2 border-b border-border -mx-2 pl-3.5 pr-4 pt-3 pb-1.5",
        "typography-body font-medium text-muted-foreground outline-hidden",
        "hover:text-foreground",
        "focus-visible:shadow-focus-ring",
      )}
    >
      <ArrowLeft
        aria-hidden="true"
        data-sub-shell-return-icon
        className="size-4 shrink-0"
      />
      <span data-sub-shell-return-label className="truncate">
        {LABEL}
      </span>
    </Link>
  );

  if (!isRail) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{LABEL}</TooltipContent>
    </Tooltip>
  );
}
