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
        "sidebar-row-hover group flex h-8 items-center gap-2 rounded-md px-2",
        "text-label font-medium text-muted-foreground outline-hidden",
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
