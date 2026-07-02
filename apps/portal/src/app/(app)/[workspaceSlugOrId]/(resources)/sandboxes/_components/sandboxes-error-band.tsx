"use client";

import { RotateCw } from "lucide-react";

interface SandboxesErrorBandProps {
  onRetry: () => void;
}

export function SandboxesErrorBand({ onRetry }: SandboxesErrorBandProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-md border border-border bg-card px-4 py-6"
    >
      <p className="typography-body text-foreground">
        Failed to load Sandboxes.{" "}
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          Retry
          <RotateCw aria-hidden="true" className="size-3.5" />
        </button>
      </p>
    </div>
  );
}
