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

export function UpgradeTierDialog({ trigger }: UpgradeTierDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      {/* DS default max-h is 80vh; lift to 85vh so the header + stepper +
          two-step body + footer all fit on 13" laptops without inner scroll
          stacking against the dialog scroll. */}
      <DialogContent size="lg" className="max-h-[85vh]">
        <UpgradeTierDialogContent onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
