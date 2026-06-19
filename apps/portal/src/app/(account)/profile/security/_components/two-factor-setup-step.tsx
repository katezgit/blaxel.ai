"use client";

import { TwoFactorAuthenticatorSetupStep } from "./two-factor-authenticator-setup-step";
import { TwoFactorSmsSetupStep } from "./two-factor-sms-setup-step";
import type { TwoFactorMethod } from "./two-factor-dialog";

interface TwoFactorSetupStepProps {
  method: TwoFactorMethod;
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  onBack: () => void;
  onCancel: () => void;
  onContinue: () => void;
}

export function TwoFactorSetupStep({
  method,
  phoneNumber,
  onPhoneNumberChange,
  onBack,
  onCancel,
  onContinue,
}: TwoFactorSetupStepProps) {
  if (method === "authenticator") {
    return (
      <TwoFactorAuthenticatorSetupStep
        onBack={onBack}
        onCancel={onCancel}
        onContinue={onContinue}
      />
    );
  }

  return (
    <TwoFactorSmsSetupStep
      phoneNumber={phoneNumber}
      onPhoneNumberChange={onPhoneNumberChange}
      onBack={onBack}
      onCancel={onCancel}
      onContinue={onContinue}
    />
  );
}
