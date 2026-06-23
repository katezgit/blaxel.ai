"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import CreditsViewInner from "@/app/(account)/account/billing/credits/_components/credits-view-inner";

interface UpgradeTierDialogProps {
  /** The element that opens the dialog. Rendered inside DialogTrigger asChild. */
  trigger: ReactNode;
}

// In-place top-up surface. Reused from /account/billing/credits — no logic
// duplicated. The Tier-3 unlock mechanism ($200+ monthly top-up activating
// Tier 3) lives in the existing top-up rules surface, not in this wrapper.
export function UpgradeTierDialog({ trigger }: UpgradeTierDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Top up credits</DialogTitle>
          <DialogDescription>
            A $200+ monthly top-up activates Tier 3. Configure automatic
            top-ups to keep the balance from running out.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <CreditsViewInner />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
