"use client";

import { useState } from "react";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { CopyButton } from "@repo/ui/components/copy-button";
import { IconButton } from "@repo/ui/components/icon-button";
import { cn } from "@repo/ui/lib/cn";

interface SecretRevealProps {
  label: string;
  value: string;
  // Skip the reveal toggle for non-sensitive identifiers (e.g. Client ID).
  sensitive: boolean;
}

// One-time reveal row for both the service-account-create and API-key-create
// flows. Sensitive values render obfuscated by default; the toggle exists so
// the user can confirm what they're copying.
export function SecretReveal({ label, value, sensitive }: SecretRevealProps) {
  const [shown, setShown] = useState(!sensitive);
  return (
    <div className="flex flex-col gap-1">
      <span className="typography-caption font-medium text-meta-foreground">
        {label}
      </span>
      <div className="flex items-center gap-2 rounded-md border border-border bg-muted-surface px-2 py-1.5">
        <code
          aria-live="polite"
          className={cn(
            "min-w-0 flex-1 truncate font-mono typography-label",
            shown ? "text-foreground" : "text-meta-foreground",
          )}
        >
          {shown ? value : maskSecret(value)}
        </code>
        {sensitive && (
          <IconButton
            variant="ghost"
            size="sm"
            aria-label={shown ? `Hide ${label}` : `Reveal ${label}`}
            onClick={() => setShown((s) => !s)}
          >
            {shown ? <EyeOff /> : <Eye />}
          </IconButton>
        )}
        <CopyButton value={value} ariaLabel={`Copy ${label}`} />
      </div>
    </div>
  );
}

function maskSecret(value: string) {
  if (value.length <= 8) return "•".repeat(value.length);
  return `${value.slice(0, 4)}${"•".repeat(value.length - 4)}`;
}

interface SecretWarningProps {
  title: string;
  description: string;
  onAcknowledge: () => void;
  acknowledgeLabel?: string;
}

export function SecretWarning({
  title,
  description,
  onAcknowledge,
  acknowledgeLabel = "I've saved it",
}: SecretWarningProps) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex items-start gap-2 rounded-md border border-state-warning/30 bg-state-warning/5 p-3">
        <AlertTriangle aria-hidden="true" className="size-4 shrink-0 text-state-warning" />
        <div className="flex flex-col gap-0.5">
          <span className="typography-label font-medium text-foreground">{title}</span>
          <span className="typography-caption text-muted-foreground">{description}</span>
        </div>
      </div>
      <div className="flex justify-end">
        <Button variant="primary" onClick={onAcknowledge}>
          {acknowledgeLabel}
        </Button>
      </div>
    </div>
  );
}
