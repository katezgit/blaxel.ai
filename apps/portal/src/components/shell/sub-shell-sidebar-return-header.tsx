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
        // Expanded: inline-flex so the pill sizes to its intrinsic content
        // (arrow + "Back") — not stretched to full sidebar width. Row keeps
        // the leading px-2 gutter that aligns with nav items below.
        "group sidebar-row-hover inline-flex h-8 items-center gap-2 rounded-md",
        isRail ? "flex justify-center px-0 w-8 mx-auto" : "px-2",
        "typography-body text-muted-foreground outline-hidden",
        "hover:text-foreground",
        "focus-visible:shadow-focus-ring",
      )}
    >
      <ArrowLeft
        aria-hidden="true"
        data-sub-shell-return-icon
        className={cn("shrink-0", isRail ? "size-[18px]" : "size-4")}
      />
      <span
        data-sub-shell-return-label
        className={cn("truncate", isRail && "sr-only")}
      >
        {LABEL}
      </span>
    </Link>
  );

  // No inner border-b, no vertical padding — Zone A's outer wrapper in
  // <Sidebar> owns the hairline separator between Zone A and the nav below
  // and controls the spacing beneath.
  return isRail ? (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{LABEL}</TooltipContent>
    </Tooltip>
  ) : (
    link
  );
}
