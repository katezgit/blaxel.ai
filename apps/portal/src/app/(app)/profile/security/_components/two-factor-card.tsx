"use client";

import { Check } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Panel } from "@/app/(manage)/_components/page-primitives";

interface TwoFactorDisabledCardProps {
  onSetup: () => void;
}

export function TwoFactorDisabledCard({ onSetup }: TwoFactorDisabledCardProps) {
  return (
    <Panel title="Two-factor authentication">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="typography-body font-medium text-foreground">
            Add a second verification step
          </p>
          <p className="typography-body text-muted-foreground">
            Protect your account with an authenticator app or text-message codes.
          </p>
        </div>
        <Button variant="primary" onClick={onSetup} className="shrink-0 self-start sm:self-auto">
          Set up two-factor
        </Button>
      </div>
    </Panel>
  );
}

interface TwoFactorEnabledCardProps {
  onDisable: () => void;
}

export function TwoFactorEnabledCard({ onDisable }: TwoFactorEnabledCardProps) {
  return (
    <Panel title="Two-factor authentication">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="inline-flex items-center gap-1.5 typography-body font-medium text-state-scored-text">
            <Check aria-hidden="true" className="size-4" />
            Two-factor authentication is on
          </p>
          <p className="typography-body text-muted-foreground">
            You&rsquo;ll be asked for a verification code each time you sign in.
          </p>
        </div>
        <Button
          variant="destructive-ghost"
          onClick={onDisable}
          className="shrink-0 self-start sm:self-auto"
        >
          Disable
        </Button>
      </div>
    </Panel>
  );
}
