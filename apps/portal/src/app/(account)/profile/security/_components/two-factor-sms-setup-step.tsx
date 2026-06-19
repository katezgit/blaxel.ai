"use client";

import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Field } from "@/app/(manage)/_components/page-primitives";
import { StepActionRow } from "./step-action-row";

interface TwoFactorSmsSetupStepProps {
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  onBack: () => void;
  onCancel: () => void;
  onContinue: () => void;
}

export function TwoFactorSmsSetupStep({
  phoneNumber,
  onPhoneNumberChange,
  onBack,
  onCancel,
  onContinue,
}: TwoFactorSmsSetupStepProps) {
  const canContinue = phoneNumber.trim().length >= 7;

  return (
    <div className="flex flex-col gap-6 pt-2">
      <p className="text-body text-muted-foreground">
        We&rsquo;ll send a one-time code to this number whenever you sign in.
        Carrier message rates may apply.
      </p>
      <Field
        label="Phone number"
        hint="Include the country code, e.g. +1 415 555 0123."
      >
        <Input
          type="tel"
          value={phoneNumber}
          onChange={(event) => onPhoneNumberChange(event.target.value)}
          placeholder="+1 415 555 0123"
          autoComplete="tel"
        />
      </Field>
      <StepActionRow>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" onClick={onContinue} disabled={!canContinue}>
          Send code
        </Button>
      </StepActionRow>
    </div>
  );
}
