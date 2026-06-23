"use client";

import { RotateCw } from "lucide-react";

interface PoliciesErrorBandProps {
  onRetry: () => void;
}

export function PoliciesErrorBand({ onRetry }: PoliciesErrorBandProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-md border border-border bg-card">
      <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr] gap-4 border-b border-border px-4 py-3 typography-table-header text-muted-foreground">
        <span>Name</span>
        <span>Type</span>
        <span>Targets</span>
        <span>Usage</span>
        <span>Updated</span>
      </div>
      <div role="alert" aria-live="assertive" className="px-4 py-8">
        <p className="typography-body text-foreground">
          Policies unavailable — could not load workspace policies.{" "}
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline focus-visible:shadow-focus-ring rounded-sm"
          >
            Retry
            <RotateCw aria-hidden="true" className="size-3.5" />
          </button>
        </p>
      </div>
    </div>
  );
}
