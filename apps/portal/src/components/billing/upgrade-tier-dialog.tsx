"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { UpgradeTierDialogContent } from "./upgrade-tier-dialog-content";

interface UpgradeTierDialogProps {
  /** The element that opens the dialog. Rendered inside DialogTrigger asChild. */
  trigger: ReactNode;
}

/**
 * Workspace-level top-up dialog. Self-contained — no imports from
 * `apps/portal/src/app/(account)/**`. The body is the rebuilt two-step
 * top-up flow (`UpgradeTierDialogContent`), not the account credits page.
 */
export function UpgradeTierDialog({ trigger }: UpgradeTierDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        // size="lg" pins 720px; widen to host the two-column Monthly layout
        // (form + About-Tier panel) without crowding either column. max-h
        // beyond the DS default 80vh keeps the stepper + form + footer from
        // crowding on shorter laptops.
        size="lg"
        className="max-h-[85vh] max-w-[860px]"
      >
        <UpgradeTierDialogContent onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
