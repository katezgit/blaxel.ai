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
      {/* No fixed height — the dialog sizes to content. Natural heights span
          from ~290px (One-time single step) up to ~845px (Monthly step 1 with
          the quota disclosure expanded), and a fixed pin would leave half the
          panel empty in the smaller states. The sm:max-h-[85vh] cap still
          guards against tall content on short viewports by letting DialogBody
          scroll internally. Below sm the DS makes DialogContent fullscreen. */}
      <DialogContent size="lg" className="sm:max-h-[85vh]">
        <UpgradeTierDialogContent
          onClose={() => setOpen(false)}
          recommendedTier={recommendedTier}
        />
      </DialogContent>
    </Dialog>
  );
}
