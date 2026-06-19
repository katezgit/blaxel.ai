"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Field } from "@/app/(manage)/_components/page-primitives";
import { StepActionRow } from "./step-action-row";
import type { TwoFactorMethod } from "./two-factor-dialog";

interface TwoFactorVerifyStepProps {
  method: TwoFactorMethod;
  onBack: () => void;
  onCancel: () => void;
  onVerified: () => void;
}

const COPY: Record<TwoFactorMethod, { hint: string }> = {
  authenticator: {
    hint: "Open your authenticator app and enter the current 6-digit code.",
  },
  sms: {
    hint: "We sent a 6-digit code by text. Enter it below to confirm.",
  },
};

export function TwoFactorVerifyStep({
  method,
  onBack,
  onCancel,
  onVerified,
}: TwoFactorVerifyStepProps) {
  const [code, setCode] = useState("");
  const trimmed = code.replace(/\D/g, "").slice(0, 6);
  const canVerify = trimmed.length === 6;

  return (
    <div className="flex flex-col gap-6 pt-2">
      <p className="text-body text-muted-foreground">{COPY[method].hint}</p>
      <Field label="Verification code">
        <Input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={trimmed}
          onChange={(event) => setCode(event.target.value)}
          placeholder="123456"
          className="font-mono tracking-widest text-center"
          aria-label="6-digit verification code"
        />
      </Field>
      <StepActionRow>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" onClick={onVerified} disabled={!canVerify}>
          Verify
        </Button>
      </StepActionRow>
    </div>
  );
}
