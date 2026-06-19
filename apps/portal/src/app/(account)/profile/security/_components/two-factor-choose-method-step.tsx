"use client";

import { MessageSquare, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/cn";
import { StepActionRow } from "./step-action-row";
import type { TwoFactorMethod } from "./two-factor-dialog";

interface MethodOption {
  value: TwoFactorMethod;
  label: string;
  description: string;
  icon: LucideIcon;
}

const METHODS: ReadonlyArray<MethodOption> = [
  {
    value: "authenticator",
    label: "Authenticator app",
    description:
      "Use 1Password, Google Authenticator, or any TOTP app on your phone.",
    icon: Smartphone,
  },
  {
    value: "sms",
    label: "Text message",
    description:
      "Receive a one-time code by SMS. Fine as a backup, weaker than an app.",
    icon: MessageSquare,
  },
];

interface TwoFactorChooseMethodStepProps {
  method: TwoFactorMethod;
  onMethodChange: (method: TwoFactorMethod) => void;
  onCancel: () => void;
  onContinue: () => void;
}

export function TwoFactorChooseMethodStep({
  method,
  onMethodChange,
  onCancel,
  onContinue,
}: TwoFactorChooseMethodStepProps) {
  return (
    <div className="flex flex-col gap-6 pt-2">
      <p className="text-body text-muted-foreground">
        Pick how you&rsquo;d like to verify when signing in.
      </p>
      <div
        role="radiogroup"
        aria-label="Two-factor method"
        className="grid gap-3 sm:grid-cols-2"
      >
        {METHODS.map((option) => {
          const Icon = option.icon;
          const isSelected = method === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onMethodChange(option.value)}
              className={cn(
                "group relative flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
                "outline-hidden focus-visible:shadow-focus-ring",
                isSelected
                  ? "border-primary bg-primary-soft"
                  : "border-border bg-card hover:border-border-strong",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted-surface text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
              </span>
              <span className="text-body font-medium text-foreground">
                {option.label}
              </span>
              <span className="text-caption text-muted-foreground">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
      <StepActionRow>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onContinue}>
          Continue
        </Button>
      </StepActionRow>
    </div>
  );
}
