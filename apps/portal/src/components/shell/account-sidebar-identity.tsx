"use client";

import { Building2 } from "lucide-react";
import { CopyButton } from "@repo/ui/components/copy-button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import { useIsSidebarRail } from "@/components/shell/use-is-sidebar-rail";
import { useAccountState } from "@/lib/mock/account-context";

// Account sub-shell sidebar identity chip. Mirrors SettingsSidebarIdentity in
// shape, padding, and iconography so the two sub-shells read as siblings; the
// distinct lucide glyph (Building2) signals "the company entity" — workspace
// chip uses Boxes for "workspace container". Maya scans this surface; the chip
// stays clean (owner email + sublabel only). The account ID is reachable via
// CopyButton when expanded and via tooltip when railed.
export function AccountSidebarIdentity() {
  const { state } = useAccountState();
  const { ownerEmail, accountId } = state.identity;
  const isRail = useIsSidebarRail();

  const card = (
    <div
      data-account-sidebar-identity
      className={cn(
        "flex items-center rounded-md",
        isRail ? "h-8 justify-center px-0" : "gap-2 px-2",
      )}
    >
      <Building2
        aria-hidden="true"
        className={cn(
          "size-4 shrink-0 text-meta-foreground",
          isRail && "size-5",
        )}
      />
      {!isRail && (
        <>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate typography-body text-foreground">
              {ownerEmail}
            </span>
            <span className="truncate typography-meta text-muted-foreground">
              Account settings
            </span>
          </div>
          <CopyButton
            value={accountId}
            ariaLabel={`Copy account ID ${accountId}`}
            tooltipLabel="Copy account ID"
          />
        </>
      )}
    </div>
  );

  return (
    <div className="py-1">
      {isRail ? (
        <Tooltip>
          <TooltipTrigger asChild>{card}</TooltipTrigger>
          <TooltipContent side="right">
            <div className="flex flex-col gap-1">
              <span>{ownerEmail}</span>
              <span className="font-mono typography-meta text-meta-foreground">
                {accountId}
              </span>
            </div>
          </TooltipContent>
        </Tooltip>
      ) : (
        card
      )}
    </div>
  );
}
