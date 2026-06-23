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
      {/* DS default max-h is 80vh; lift to 85vh on ≥sm so the header + stepper +
          two-step body + footer all fit on 13" laptops without inner scroll
          stacking against the dialog scroll. Below sm the DS makes DialogContent
          fullscreen — leave that uncapped. */}
      <DialogContent size="lg" className="sm:max-h-[85vh]">
        <UpgradeTierDialogContent
          onClose={() => setOpen(false)}
          recommendedTier={recommendedTier}
        />
      </DialogContent>
    </Dialog>
  );
}
