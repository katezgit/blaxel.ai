"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Stepper, type StepperStep } from "@repo/ui/components/stepper";
import { TwoFactorChooseMethodStep } from "./two-factor-choose-method-step";
import { TwoFactorSetupStep } from "./two-factor-setup-step";
import { TwoFactorVerifyStep } from "./two-factor-verify-step";
import { TwoFactorRecoveryStep } from "./two-factor-recovery-step";

export type TwoFactorMethod = "authenticator" | "sms";
type StepIndex = 1 | 2 | 3 | 4;

const STEPS: ReadonlyArray<StepperStep> = [
  { label: "Choose method" },
  { label: "Set up" },
  { label: "Verify" },
  { label: "Recovery codes" },
];

interface TwoFactorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function TwoFactorDialog({
  open,
  onOpenChange,
  onComplete,
}: TwoFactorDialogProps) {
  const [step, setStep] = useState<StepIndex>(1);
  const [method, setMethod] = useState<TwoFactorMethod>("authenticator");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Reset wizard state every time the dialog closes so reopening starts clean.
  // Radix keeps the panel mounted across open/close transitions.
  useEffect(() => {
    if (!open) {
      setStep(1);
      setMethod("authenticator");
      setPhoneNumber("");
    }
  }, [open]);

  const goBack = () => {
    setStep((current) => (current > 1 ? ((current - 1) as StepIndex) : current));
  };

  const handleCancel = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        className="max-w-[calc(100vw-2rem)] max-h-[90vh] sm:max-h-[80vh]"
      >
        <DialogHeader>
          <DialogTitle>Set up two-factor authentication</DialogTitle>
          <div className="mt-4">
            <Stepper steps={STEPS} currentStep={step} />
          </div>
        </DialogHeader>
        <DialogBody>
          {step === 1 && (
            <TwoFactorChooseMethodStep
              method={method}
              onMethodChange={setMethod}
              onCancel={handleCancel}
              onContinue={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <TwoFactorSetupStep
              method={method}
              phoneNumber={phoneNumber}
              onPhoneNumberChange={setPhoneNumber}
              onBack={goBack}
              onCancel={handleCancel}
              onContinue={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <TwoFactorVerifyStep
              method={method}
              onBack={goBack}
              onCancel={handleCancel}
              onVerified={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <TwoFactorRecoveryStep
              onBack={goBack}
              onCancel={handleCancel}
              onDone={onComplete}
            />
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
