"use client";

import { Button } from "@repo/ui/components/button";
import { CopyButton } from "@repo/ui/components/copy-button";
import { StepActionRow } from "./step-action-row";

const MOCK_SECRET = "JBSWY3DPEHPK3PXP";

const QR_TILE_GRID = Array.from({ length: 8 }, (_, row) =>
  Array.from({ length: 8 }, (_, col) => {
    const value = (row * 7 + col * 11 + (row * col)) % 5;
    return value > 1;
  }),
);

interface TwoFactorAuthenticatorSetupStepProps {
  onBack: () => void;
  onCancel: () => void;
  onContinue: () => void;
}

export function TwoFactorAuthenticatorSetupStep({
  onBack,
  onCancel,
  onContinue,
}: TwoFactorAuthenticatorSetupStepProps) {
  return (
    <div className="flex flex-col gap-6 pt-2">
      <p className="text-body text-muted-foreground">
        Scan this code with your authenticator app, then enter the 6-digit code
        in the next step.
      </p>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div className="flex size-44 items-center justify-center rounded-lg border border-border bg-card p-3">
          <QRMosaic />
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-1">
          <p className="text-body font-medium text-foreground">
            Can&rsquo;t scan it?
          </p>
          <p className="text-caption text-muted-foreground">
            Enter this setup key into your app manually.
          </p>
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted-surface p-2">
            <code className="flex-1 truncate font-mono text-body tracking-wider text-foreground">
              {MOCK_SECRET}
            </code>
            <CopyButton value={MOCK_SECRET} tooltipLabel="Copy setup key" />
          </div>
        </div>
      </div>
      <StepActionRow>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" onClick={onContinue}>
          I scanned the code
        </Button>
      </StepActionRow>
    </div>
  );
}

function QRMosaic() {
  return (
    <svg
      viewBox="0 0 8 8"
      aria-hidden="true"
      role="img"
      className="size-full text-foreground"
    >
      <title>Two-factor QR code preview</title>
      {QR_TILE_GRID.flatMap((row, rowIdx) =>
        row.map((filled, colIdx) =>
          filled ? (
            <rect
              key={`${rowIdx}-${colIdx}`}
              x={colIdx}
              y={rowIdx}
              width={1}
              height={1}
              fill="currentColor"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}
