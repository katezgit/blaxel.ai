"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { AddDomainDialog } from "./add-domain-dialog";

interface AddDomainButtonProps {
  disabled: boolean;
}

export function AddDomainButton({ disabled }: AddDomainButtonProps) {
  const [open, setOpen] = useState(false);

  const trigger = (
    <Button
      variant="primary"
      disabled={disabled}
      onClick={() => setOpen(true)}
    >
      Add domain
    </Button>
  );

  if (disabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Disabled Button doesn't fire hover events on its own; wrap in a
              span so the tooltip can anchor to the pointer-capturing parent. */}
          <span tabIndex={0}>{trigger}</span>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Upgrade to Tier 3 to register custom domains
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <>
      {trigger}
      <AddDomainDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
