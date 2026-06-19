"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import { CopyButton } from "@repo/ui/components/copy-button";
import { StepActionRow } from "./step-action-row";

interface TwoFactorRecoveryStepProps {
  onBack: () => void;
  onCancel: () => void;
  onDone: () => void;
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateRecoveryCodes(count: number): ReadonlyArray<string> {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    let code = "";
    for (let c = 0; c < 8; c++) {
      // Deterministic-ish pseudo-random — the fixture only needs to look
      // plausible, not be cryptographically strong.
      const idx = (i * 17 + c * 31) % ALPHABET.length;
      code += ALPHABET[idx];
    }
    codes.push(code);
  }
  return codes;
}

export function TwoFactorRecoveryStep({
  onBack,
  onCancel,
  onDone,
}: TwoFactorRecoveryStepProps) {
  const codes = useMemo(() => generateRecoveryCodes(10), []);
  const [acknowledged, setAcknowledged] = useState(false);
  const joined = codes.join("\n");

  const downloadHref = useMemo(
    () =>
      "data:text/plain;charset=utf-8," + encodeURIComponent(joined),
    [joined],
  );

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex flex-col gap-2">
        <p className="text-body font-medium text-foreground">
          Save your recovery codes
        </p>
        <p className="text-body text-muted-foreground">
          Keep these somewhere safe. Each code can be used once if you lose
          access to your authenticator or phone.
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-muted-surface p-4 sm:grid-cols-2">
        {codes.map((code) => (
          <li
            key={code}
            className="font-mono text-body tracking-wider text-foreground"
          >
            {code}
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button asChild variant="secondary">
          <a href={downloadHref} download="blaxel-recovery-codes.txt">
            <Download aria-hidden="true" className="size-3.5" />
            Download .txt
          </a>
        </Button>
        <CopyButton value={joined} tooltipLabel="Copy all codes" />
      </div>
      <label className="flex items-start gap-3">
        <Checkbox
          checked={acknowledged}
          onCheckedChange={(value) => setAcknowledged(value === true)}
          aria-label="I have saved my recovery codes"
        />
        <span className="text-body text-foreground">
          I&rsquo;ve saved these recovery codes somewhere safe.
        </span>
      </label>
      <StepActionRow>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" onClick={onDone} disabled={!acknowledged}>
          Turn on two-factor
        </Button>
      </StepActionRow>
    </div>
  );
}
