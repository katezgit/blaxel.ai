"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogCancelButton,
  DialogConfirmButton,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";

interface JoinWaitlistDialogProps {
  trigger: ReactNode;
  /** Invoked after the user confirms. Parent persists state + re-renders. */
  onConfirmed: () => void;
}

export default function JoinWaitlistDialog({
  trigger,
  onConfirmed,
}: JoinWaitlistDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    setOpen(false);
    onConfirmed();
    toast.success("You're on the waitlist — we'll follow up by email");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Join the Agent Drive waitlist</DialogTitle>
          <DialogDescription>
            We&rsquo;ll email you when your account gets access. No other action
            needed from you.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogCancelButton />
          <DialogConfirmButton onClick={handleConfirm}>
            Confirm
          </DialogConfirmButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
