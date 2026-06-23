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
import BillingProfile from "@/app/(account)/account/billing/invoices-payment/_components/billing-profile";

interface AddPaymentMethodDialogProps {
  /** The element that opens the dialog. Rendered inside DialogTrigger asChild. */
  trigger: ReactNode;
}

// In-place payment-method surface. Reused from /account/billing/invoices-payment —
// no logic duplicated. The actual card-entry form lives on Stripe (hosted
// payment page); this dialog surfaces the current state + the Edit-in-Stripe
// handoff without yanking Alex out of the runtime context.
export function AddPaymentMethodDialog({ trigger }: AddPaymentMethodDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Payment method</DialogTitle>
          <DialogDescription>
            Card details are managed on Stripe&apos;s hosted page.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <BillingProfile />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
