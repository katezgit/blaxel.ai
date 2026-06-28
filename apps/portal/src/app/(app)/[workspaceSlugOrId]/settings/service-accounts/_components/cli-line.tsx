"use client";

import { CopyButton } from "@repo/ui/components/copy-button";
import { cn } from "@repo/ui/lib/cn";

interface CliLineProps {
  command: string;
  /** Optional `CLI` lead-in label rendered above the row. */
  label?: string;
  className?: string;
}

// The command itself sits in a horizontally-scrolling row so long flags can
// be revealed without forcing the parent layout to break to a second line;
// the copy affordance stays pinned beside it for one-gesture access.
export default function CliLine({ command, label, className }: CliLineProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label != null && (
        <span className="typography-caption text-meta-foreground">{label}</span>
      )}
      <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted-surface px-3 py-2">
        <code className="min-w-0 flex-1 overflow-x-auto whitespace-pre font-mono typography-code text-foreground">
          {command}
        </code>
        <CopyButton value={command} ariaLabel={`Copy: ${command}`} />
      </div>
    </div>
  );
}
