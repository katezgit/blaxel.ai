"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import type { SelectableTier } from "@/lib/mock/billing-tiers";
import UpgradeTierDialogContent from "./upgrade-tier-dialog-content";

interface UpgradeTierDialogProps {
  /** The element that opens the dialog. Rendered inside DialogTrigger asChild. */
  trigger: ReactNode;
  /** Tier the launching surface needs — pre-selected and marked Recommended. */
  recommendedTier?: SelectableTier;
}

export default function UpgradeTierDialog({
  trigger,
  recommendedTier,
}: UpgradeTierDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      {/* Fixed sm+ height pins the panel chrome so toggling Monthly ↔ One-time,
          stepping through the wizard, or expanding the "Show more quotas"
          disclosure does not visibly resize the dialog. 880px is sized for the
          tallest natural state (Monthly step 1 with the quota disclosure expanded
          ≈ 873px). On viewports shorter than ~1035px the 85vh cap takes over and
          DialogBody scrolls internally. Below sm the DS makes DialogContent
          fullscreen — leave that uncapped. */}
      <DialogContent size="lg" className="sm:h-[880px] sm:max-h-[85vh]">
        <UpgradeTierDialogContent
          onClose={() => setOpen(false)}
          recommendedTier={recommendedTier}
        />
      </DialogContent>
    </Dialog>
  );
}
