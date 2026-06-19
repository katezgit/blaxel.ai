"use client";

import { Check, ShieldCheck } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Panel } from "@/app/(manage)/_components/page-primitives";

interface TwoFactorCardProps {
  enabled: boolean;
  onSetup: () => void;
  onDisable: () => void;
}

export function TwoFactorCard({ enabled, onSetup, onDisable }: TwoFactorCardProps) {
  return (
    <Panel title="Two-factor authentication">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted-surface text-muted-foreground"
          >
            <ShieldCheck className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            {enabled ? (
              <>
                <p className="inline-flex items-center gap-1.5 text-body font-medium text-state-scored-text">
                  <Check aria-hidden="true" className="size-4" />
                  Two-factor authentication is on
                </p>
                <p className="text-body text-muted-foreground">
                  You&rsquo;ll be asked for a verification code each time you sign in.
                </p>
              </>
            ) : (
              <>
                <p className="text-body font-medium text-foreground">
                  Add a second verification step
                </p>
                <p className="text-body text-muted-foreground">
                  Protect your account with an authenticator app or text-message codes.
                </p>
              </>
            )}
          </div>
        </div>
        <div className="shrink-0">
          {enabled ? (
            <Button variant="destructive-ghost" onClick={onDisable}>
              Disable
            </Button>
          ) : (
            <Button variant="primary" onClick={onSetup}>
              Set up two-factor
            </Button>
          )}
        </div>
      </div>
    </Panel>
  );
}
