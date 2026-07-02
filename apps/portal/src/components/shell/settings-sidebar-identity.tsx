"use client";

import { Boxes } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import { useIsSidebarRail } from "@/components/shell/use-is-sidebar-rail";
import type { Org } from "@/lib/mock/types";

interface SettingsSidebarIdentityProps {
  workspace: Org;
}

// Static label — names which workspace's settings are being edited. Sits
// between the Back link and the nav items. Intentionally not a dropdown: the
// global topbar switcher already conflated "switch app context" with "edit a
// different workspace's settings"; a label here keeps it unambiguous. To
// target another workspace's settings, the user exits via Back and re-enters
// from that workspace.
export function SettingsSidebarIdentity({
  workspace,
}: SettingsSidebarIdentityProps) {
  const isRail = useIsSidebarRail();

  const card = (
    <div
      data-settings-sidebar-identity
      className={cn(
        "flex items-center rounded-md",
        isRail ? "h-8 justify-center px-0" : "gap-2 px-2",
      )}
    >
      <Boxes
        aria-hidden="true"
        className={cn(
          "size-4 shrink-0 text-meta-foreground",
          isRail && "size-[18px]",
        )}
      />
      {!isRail && (
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate typography-body text-foreground">
            {workspace.name}
          </span>
          <span className="truncate typography-meta text-muted-foreground">
            Workspace settings
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="py-1">
      {isRail ? (
        <Tooltip>
          <TooltipTrigger asChild>{card}</TooltipTrigger>
          <TooltipContent side="right">{workspace.name}</TooltipContent>
        </Tooltip>
      ) : (
        card
      )}
    </div>
  );
}
